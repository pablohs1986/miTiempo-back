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

/** Passport Google Strategy: checks if the Google id of the account selected
 * by the user at the Google prompt is already registered in the database. If so,
 * assign a return message to the password variable. If not, create a new user
 * with that Google id. Subsequently, the strategy redirects to the established callback. */
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
					'You already have a valid password. Check the registration email or reply to this email to request a new password.';
				return done(null, existingUser);
			}
			const user = await new User({
				googleId: profile.id,
				email: profile.emails[0].value,
				password: newPassword,
				name: profile.displayName,
			}).save();
			done(null, user);
		}
	)
);

/** Function that generates a random password */
function generatePassword() {
	return Math.floor(10000000 + Math.random() * 90000000);
}

/** Route that redirects to the Google authentication system, through
 * the Google Strategy established for passport. */
router.get(
	'/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

/** Callback for Google Strategy. It uses Nodemailer and SendGrid to send
 * an email to the registered user with a random password or a message
 * indicating that they already have a password. It then redirects to the
 * email sending confirmation page.*/
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
			html: `<strong><h1 style="color: #C830CC">Welcome to miTiempo</h1></strong>
            <br>Here are your account details, necessary to log into the app:
            <br><br>- <strong style="color: #C830CC">Email</strong>: ${req.user.email}
            <br>- <strong style="color: #C830CC">Password</strong>: ${this.password}
            <br><br>Thank you and enjoy miTiempo!
            <br><br><br><em>miTiempo - Made with &#10084;&#65039; by Pablo Herrero</em>`,
		});

		res.redirect('https://mitiempoapp.netlify.app/signupconfirmation');
	}
);

/** Route of entry to the app */
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
