const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/library.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/likes", authMiddleware.authUser, libraryController.getLikedSongs);
router.post("/likes/:musicId/toggle", authMiddleware.authUser, libraryController.toggleLikedSong);
router.get("/recent", authMiddleware.authUser, libraryController.getRecentPlays);
router.post("/recent", authMiddleware.authUser, libraryController.recordRecentPlay);

module.exports = router;
