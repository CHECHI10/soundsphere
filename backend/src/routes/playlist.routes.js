const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { check } = require('express-validator');
const { runValidations } = require('../middlewares/validate.middleware');

router.get("/", authMiddleware.authUser, playlistController.listPlaylists);
router.post(
	"/",
	authMiddleware.authUser,
	[check('name').notEmpty().withMessage('name is required')],
	runValidations,
	playlistController.createPlaylist,
);
router.get("/:playlistId", authMiddleware.authUser, playlistController.getPlaylistById);
router.patch("/:playlistId", authMiddleware.authUser, playlistController.renamePlaylist);
router.delete("/:playlistId", authMiddleware.authUser, playlistController.deletePlaylist);
router.post(
	"/:playlistId/musics",
	authMiddleware.authUser,
	[check('musicId').notEmpty().withMessage('musicId is required')],
	runValidations,
	playlistController.addMusicToPlaylist,
);

router.delete(
	"/:playlistId/musics/:musicId",
	authMiddleware.authUser,
	playlistController.removeMusicFromPlaylist,
);

router.patch(
	"/:playlistId/reorder",
	authMiddleware.authUser,
	[check('musics').isArray({ min: 1 }).withMessage('musics must be a non-empty array')],
	runValidations,
	playlistController.reorderPlaylist,
);

module.exports = router;
