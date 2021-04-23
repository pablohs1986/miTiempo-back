/** Middleware that transforms the data received from the frontent for correct
 * handling in the backend.
 * */
module.exports = (req, res, next) => {
	req.body.duration = handleDataType('duration', req.body.duration);
	req.body.color = handleDataType('color', req.body.color);
	req.body.isPomodoro = handleDataType('isPomodoro', req.body.isPomodoro);
	next();
};

/** Method that, depending on the type of data, transforms it */
function handleDataType(dataType, data) {
	switch (dataType) {
		case 'duration':
			if (data === '5 min') {
				return 300;
			}
			if (data === '15 min') {
				return 900;
			}
			if (data === '30 min') {
				return 1800;
			}
			if (data === '45 min') {
				return 2700;
			}
			if (data === '1 h') {
				return 3600;
			}
			if (data === '2 h') {
				return 7200;
			}
			if (data === '3 h') {
				return 10800;
			}
			if (data === '4 h') {
				return 14400;
			}
			if (data === '5 h') {
				return 18000;
			}
			if (data === '6 h') {
				return 21600;
			}
			if (data === '7 h') {
				return 25200;
			}
			if (data === '8 h') {
				return 28800;
			}
		case 'color':
			if (data === 'Black') {
				return '#000000';
			}
			if (data === 'White') {
				return '#f8f8f2';
			}
			if (data === 'Blue') {
				return '#7329D9';
			}
			if (data === 'Brown') {
				('#CC9245');
			}
			if (data === 'Grey') {
				return '#6e7185';
			}
			if (data === 'Green') {
				return '#6ECC31';
			}
			if (data === 'Orange') {
				return '#ffb86c';
			}
			if (data === 'Pink') {
				return '#7C1280';
			}
			if (data === 'Red') {
				return '#FF2431';
			}
			if (data === 'Yellow') {
				return '#FFF924';
			}
		case 'isPomodoro':
			data === 'Yes' ? true : false;
	}
}
