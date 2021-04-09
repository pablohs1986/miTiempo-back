require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Express instance
const app = express();

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
});

checkConnection();

app.get('/', (req, res) => {
	res.send('Hello, miTiempo!!!');
});

// Server initialization
let port = process.env.PORT;
if (port == null || port == '') {
	port = 3000;
}
app.listen(port, () => {
	console.log(`Listening on ${port}.`);
});

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
