const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

/** Middleware that validates a user based on his token.
 * It takes an incoming request and check if there's a token in it.
 * If the token exists, it's validated and the user asigned to that token
 * is assigned to the request.
 */
module.exports = (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization) {
		return res.status(401).send({ error: 'You must be logged in.' });
	}

	const token = authorization.replace('Bearer ', '');

	jwt.verify(token, process.env.TOKEN_KEY, async (err, payload) => {
		if (err) {
			return res.status(401).send({ error: 'You must be logged in.' });
		}

		const { userId } = payload;

		const user = await User.findById(userId);
		req.user = user;
		next();
	});
};
