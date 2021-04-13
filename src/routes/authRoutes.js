const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middlewares/requireAuth');

// Express router instance
const router = express.Router();

/** Require auth */
router.get('/', requireAuth, (req, res) => {
	res.send(`Your email ${req.user.email}`);
});

/** Route that try to sign up a user.
 *  Try to save a new user, if the user doesn't exist, creates the user.
 */
router.post('/signup', async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = new User({ email, password });
		await user.save();
		const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
		res.send({ token });
	} catch (err) {
		return res.status(422).send(err.message);
	}
});

/** Route that try to sign in a user.
 * Verify that the required fields are entered and that the user exists.
 * If so, it compares the supplied password, if it matches the stored one,
 * it returns to the user a token that will help them to automatically log in
 * the next few times.
 */
router.post('/signin', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(422)
			.send({ error: ' Must provide email and password.' });
	}

	const user = await User.findOne({ email });

	if (!user) {
		return res.status(422).send({ error: 'Invalid password or email.' });
	}

	try {
		await user.comparePassword(password);
		const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
		res.send({ token });
	} catch (err) {
		return res.status(422).send({ Error: 'Invalid password or email.' });
	}
});

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
