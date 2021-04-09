const express = require('express');

// Server instance
const app = express();

app.get('/', (req, res) => {
	res.send('Hello, miTiempo!!!');
});

// Server initialization
app.listen(3000, () => {
	console.log('Listening on 3000.');
});
