const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { query } = require('express-validator');
const { runValidations } = require('../middlewares/validate.middleware');

router.get(
	"/",
	authMiddleware.authUser,
	[query('q').optional().isString().trim().isLength({ max: 200 }).withMessage('query too long')],
	runValidations,
	searchController.search,
);

module.exports = router;
