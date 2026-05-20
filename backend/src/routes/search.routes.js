const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware.authUser, searchController.search);

module.exports = router;
