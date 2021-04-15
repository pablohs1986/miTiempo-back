const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middlewares/requireAuth');

// Express router instance
const router = express.Router();

/** Method that retrieves the information of a user.
 * It receives a token that validates. If the validation is successful,
 * send the user information. If the validation is not correct,
 * it sends an error message.
 */
router.get('/getUserInfo', requireAuth, async (req, res) => {
	const user = await User.findOne(req.user._id);

	try {
		res.send({ user });
	} catch (error) {
		return res.status(422).send({
			Error:
				'Something went wrong retrieving user information. Try again.',
		});
	}
});

module.exports = router;
