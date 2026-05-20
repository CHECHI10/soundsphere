const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/:artistId", authMiddleware.authUser, artistController.getArtistProfile);

module.exports = router;
