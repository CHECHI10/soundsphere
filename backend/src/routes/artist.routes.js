const express = require("express");
const router = express.Router();

const artistController = require("../controllers/artist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { param } = require('express-validator');
const { runValidations } = require('../middlewares/validate.middleware');

router.get(
	"/:artistId",
	authMiddleware.authUser,
	[param('artistId').isMongoId().withMessage('invalid artist id')],
	runValidations,
	artistController.getArtistProfile,
);

module.exports = router;
