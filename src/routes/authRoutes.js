const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middlewares/requireAuth');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
let password;

// Express router instance
const router = express.Router();
// TODO: http://gregtrowbridge.com/node-authentication-with-google-oauth-part2-jwts/

/** Function that generates a random password */
function generatePassword() {
	return Math.floor(10000000 + Math.random() * 90000000);
}

// Passport instance for OAuth
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		async (accessToken, refreshToken, profile, done) => {
			const existingUser = await User.findOne({ googleId: profile.id });
			let newPassword = generatePassword();
			this.password = newPassword;

			if (existingUser) {
				this.password =
					'You already have a valid password. Check the registration email or write to the admin to generate a new password.';
				return done(null, existingUser);
			}
			const user = await new User({
				googleId: profile.id,
				email: profile.emails[0].value,
				password: newPassword, // Generates a password to the user
				name: profile.displayName,
			}).save();
			done(null, user);
		}
	)
);
// TODO add nodemailer a la docu
// Autenticación Google
// Crear usuario y generar contraseña
// Enviar por email
// Login con usuario y contraseña

/** OAuth routes */

router.get(
	'/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

router.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/', session: false }),
	async (req, res) => {
		var transporter = nodemailer.createTransport(
			sendGridTransport({
				auth: {
					api_key: process.env.SENDGRID_API,
				},
			})
		);

		transporter.sendMail({
			from: 'mitiempo.phesan@gmail.com',
			to: req.user.email,
			subject: 'Welcome to miTiempo',

			html: `<strong><h1>Welcome to miTiempo!</h1></strong>
            <br>Here are your account details, necessary to log into the app:
            <br><br>- <strong>Email</strong>: ${req.user.email}
            <br>- <strong>Password</strong>: ${this.password}
            <br><br>Thank you and enjoy miTiempo!
            <br><br><br><em>miTiempo - Made with &#10084;&#65039; by Pablo Herrero</em>`,
		});

		res.send(
			'An email has been sent with your access credentials. Thanks.'
		);
	}
);

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
