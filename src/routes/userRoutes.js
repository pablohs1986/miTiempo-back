const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const requireAuth = require('../middlewares/requireAuth');

// Express router instance
const router = express.Router();
router.use(requireAuth); //Everything done here, need to validate the token

/** Route that retrieves the information of a user.
 * It receives a token that is validated by the authorization layer. If the
 * validation is successful, send the user information. If the validation
 * is not correct, it sends an error message.
 */
router.get('/getUserInfo', async (req, res) => {
	const user = await User.findById(req.user._id);
	const email = user.email;
	const name = user.name;
	const city = user.city;

	try {
		res.send({ email, name, city });
	} catch (error) {
		return res.status(422).send({
			Error:
				'Something went wrong retrieving user information. Try again.',
		});
	}
});

/** Route that updates a user's information.
 * It receives a token that is validated by the authorization layer, and the data
 * to be modified. If the validation is successful, apply the changes. If the validation
 * is not correct, it sends an error.
 */
router.post('/updateUserInfo', async (req, res) => {
	const { email, name, city, newPassword } = req.body;
	const userId = req.user._id;

	try {
		const user = await User.findById(userId);
		user.email = email;
		user.password = newPassword;
		user.name = name;
		user.city = city;

		await user.save();
		res.send(user);
	} catch (error) {
		res.status(422).send({ error: error.message });
	}
});

module.exports = router;
