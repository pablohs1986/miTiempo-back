const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middlewares/requireAuth');

// Express router instance
const router = express.Router();
// TODO: http://gregtrowbridge.com/node-authentication-with-google-oauth-part2-jwts/

// Passport instance for OAuth
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		(accesToken, refreshToken, profile, done) => {
			User.findOne({ googleId: profile.id }).then((existingUser) => {
				if (existingUser) {
					done(null, existingUser);
				} else {
					new User({
						googleId: profile.id,
						email: profile.emails[0].value,
						password: profile.id,
						name: profile.displayName,
					})
						.save()
						.then((user) => done(null, user));
				}
			});

			console.log(profile.emails[0].value);
		}
	)
);

/** OAuth routes */

router.get(
	'/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

router.get('/current_user', (req, res) => {
	res.send(req.user);
});

router.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/', session: false }),
	async (req, res) => {
		const _id = req.user._id;
		// const redirectURL = '/loginGoogle?ID=' + user._id;
		// res.redirect(redirectURL);
		// 	const _id = req.query.ID;

		if (!_id) {
			return res
				.status(422)
				.send({ error: ' Must provide Google validation.' });
		}

		const user = await User.findOne({ _id });
		console.log(user);

		if (!user) {
			return res
				.status(422)
				.send({ error: 'Invalid Google validation.' });
		}

		try {
			const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
			console.log(token);
			res.send({ token });
		} catch (err) {
			return res
				.status(422)
				.send({ Error: 'Invalid Google validation.' });
		}
	}
);

// router.get('/loginGoogle', async (req, res) => {
// 	const _id = req.query.ID;

// 	if (!_id) {
// 		return res
// 			.status(422)
// 			.send({ error: ' Must provide Google validation.' });
// 	}

// 	const user = await User.findOne({ _id });

// 	if (!user) {
// 		return res.status(422).send({ error: 'Invalid Google validation.' });
// 	}

// 	try {
// 		const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
// 		res.send({ token });
// 	} catch (err) {
// 		return res.status(422).send({ Error: 'Invalid Google validation.' });
// 	}
// });

/** Require auth */
router.get('/', requireAuth, (req, res) => {
	// res.send(`Your email ${req.user.email}`);
	res.send(req.user);
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

module.exports = router;
