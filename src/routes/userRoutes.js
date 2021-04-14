const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middlewares/requireAuth');

// Express router instance
const router = express.Router();

/** TODO: documentar */
router.get('/getUserInfo', requireAuth, async (req, res) => {
	const email = await req.user.email;
	const user = await User.findOne({ email });

	try {
		res.send({ user });
	} catch (error) {
		return res.status(422).send({
			Error: 'Something wrong when accesing to database. Try again.',
		});
	}
});

module.exports = router;
