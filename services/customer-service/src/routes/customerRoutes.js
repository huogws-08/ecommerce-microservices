
const express = require("express");
const {
    getCustomer,
    updateCustomer,
} = require("../controllers/customerController");

const router = express.Router();

router.get("/:uid", getCustomer);
router.put("/:uid", updateCustomer);

module.exports = router;
