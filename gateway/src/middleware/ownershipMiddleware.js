function requireOwnerOrAdmin(req, res, next) {
    const requestedUid = Number(req.params.uid);
    const authenticatedUid = Number(req.user?.uid);

    if (!Number.isInteger(requestedUid) || requestedUid <= 0) {
        return res.status(400).json({
            message: "Invalid customer ID",
        });
    }

    if (
        req.user?.role === "ADMIN" ||
        requestedUid === authenticatedUid
    ) {
        return next();
    }

    return res.status(403).json({
        message: "Forbidden: cannot access another customer's data",
    });
}

module.exports = requireOwnerOrAdmin;