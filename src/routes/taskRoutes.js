const express = require('express');
const mongoose = require('mongoose');
const Task = mongoose.model('Task');
const requireAuth = require('../middlewares/requireAuth');

// Express router instance
const router = express.Router();
router.use(requireAuth); //Everything done here, need to validate the token

/** Route that adds a task for a user.
 * It receives a token that is validated by the authorization layer. If the
 * validation is successful, make a request for add a new task for that user.
 */
router.post('/addTask', async (req, res) => {
	const {
		title,
		description,
		category,
		duration,
		repeat,
		color,
		creationDate,
		expirationDate,
		isPomodoro,
		isDone,
	} = req.body;

	try {
		const task = new Task({
			title,
			description,
			category,
			duration,
			repeat,
			color,
			creationDate,
			expirationDate,
			isPomodoro,
			isDone,
			userId: req.user._id,
		});
		await task.save();
		res.send(task);
	} catch (error) {
		res.status(422).send({ error: error.message });
	}
});

/** Route that lists all the tasks for a user */
router.get('/listTasks', async (req, res) => {
	const tasks = await Task.find({ userId: req.user._id });
	res.send(tasks);
});

/** TODO: (documentar) List today tasks */
router.get('/listTodayTasks', async (req, res) => {
	const tasks = await Task.find({
		userId: req.user._id,
		expirationDate: new Date().toISOString().slice(0, 10),
	});
	res.send(tasks);
});

/** TODO: Delete Task */
router.delete('/deleteTask', async (req, res) => {
	try {
		await Task.findByIdAndDelete(req.task._id);
		res.send(req.task._id + ' succesfully deleted.');
	} catch (error) {
		res.status(422).send({ error: error.message });
	}
});

module.exports = router;
