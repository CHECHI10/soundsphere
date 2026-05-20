const express = require("express");
const router = express.Router();
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

const { check } = require('express-validator');
const { runValidations } = require('../middlewares/validate.middleware');

router.post(
  "/upload",
  authMiddleware.authArtist,
  upload.single("music"),
  [check('title').notEmpty().withMessage('title is required')],
  runValidations,
  musicController.createMusic,
);

router.post(
  "/album",
  authMiddleware.authArtist,
  [
    check('title').notEmpty().withMessage('title is required'),
    check('musics').isArray({ min: 1 }).withMessage('musics must be a non-empty array'),
  ],
  runValidations,
  musicController.createAlbum,
);

router.get("/mine", authMiddleware.authArtist, musicController.getMyMusics);

router.get("/albums/mine", authMiddleware.authArtist, musicController.getMyAlbums);

router.get("/uploads/mine", authMiddleware.authArtist, musicController.getMyUploads);

router.get("/", authMiddleware.authUser, musicController.getAllMusics);

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums);

router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById);

module.exports = router;
