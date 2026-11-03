
const express = require("express");

const {
    getCustomer,
    updateCustomer,
    getMembership,
    updateMembership,
} = require("../controllers/customerController");

const router = express.Router();

router.get("/:uid/membership", getMembership);
router.patch("/:uid/membership", updateMembership);

router.get("/:uid", getCustomer);
router.put("/:uid", updateCustomer);

module.exports = router;
