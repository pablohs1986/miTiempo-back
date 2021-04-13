require('dotenv').config();
require('./models/User');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

// Express instance
const app = express();
app.use(bodyParser.json());
app.use(authRoutes);
app.use(cors);

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
});

checkConnection();

// Server initialization
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Listening on ${PORT}.`);
});

// Routes

// Aux methods
/** Method that checks the connection to MongoDB cluster and show on
 * the terminal the confirmation or the error.
 */
function checkConnection() {
	mongoose.connection.on('connected', () => {
		console.log('Connected to MongoDB instance.');
	});

	mongoose.connection.on('error', (error) => {
		console.log('Error connecting MongoDB,' + error);
	});
}
