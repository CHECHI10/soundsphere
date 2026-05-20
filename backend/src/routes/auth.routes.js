const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require('../middlewares/auth.middleware');
const { check } = require('express-validator');
const { runValidations } = require('../middlewares/validate.middleware');

router.post(
	'/register',
	[
		check('username').notEmpty().withMessage('username is required'),
		check('email').isEmail().withMessage('valid email is required'),
		check('password').isLength({ min: 6 }).withMessage('password min 6 chars'),
	],
	runValidations,
	authController.registerUser,
);

router.post(
	'/login',
	[
		check('password').notEmpty().withMessage('password is required'),
		check().custom((_, { req }) => {
			if (!req.body.username && !req.body.email) throw new Error('username or email required');
			return true;
		}),
	],
	runValidations,
	authController.loginUser,
);

router.post('/logout', authController.logoutUser);
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
