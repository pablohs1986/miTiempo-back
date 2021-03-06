const express = require('express');
const mongoose = require('mongoose');
const Task = mongoose.model('Task');
const requireAuth = require('../middlewares/requireAuth');
const checkFieldsToUpdate = require('../middlewares/checkFieldsToUpdate');
const newTaskDataHandler = require('../middlewares/newTaskDataHandler');

// Express router instance
const router = express.Router();
// router.use(requireAuth); //Everything done here, need to validate the token

/** Route that adds a task for a user.
 * It receives a token that is validated by the authorization layer. If the
 * validation is successful, make a request for add a new task for that user.
 */
router.post('/addTask', requireAuth, newTaskDataHandler, async (req, res) => {
	const {
		title,  
		description,
		day,
		duration,
		repetition,
		category,
		color,
		isPomodoro,
		creationDate,
		isDone,
	} = req.body;

	try {
		const task = new Task({
			title,
			description,
			day,
			duration,
			repetition,
			category,
			color,
			isPomodoro,
			creationDate,
			isDone,
			userId: req.user._id,
		});
		await task.save();
		res.send(task);
	} catch (error) {
		res.status(422).send({ error: error.message });
	}
});

/** Route that lists all the tasks for a user, except the finished ones.
 * filtered or not by category. If there's a problem doing the query,
 * it throws an error.
 */
router.get('/listTasks/:categoryFilter', requireAuth, async (req, res) => {
	try {
		if (req.params.categoryFilter === 'All') {
			const tasks = await Task.find({ userId: req.user._id })
				.sort({
					creationDate: -1,
				})
				.where('category')
				.ne('Done');
			res.send(tasks);
		} else {
			const tasksFiltered = await Task.find({
				userId: req.user._id,
				category: req.params.categoryFilter,
			}).sort({ creationDate: -1 });

			res.send(tasksFiltered);
		}
	} catch (error) {
		return res.status(422).send({
			Error: 'Something went wrong retrieving tasks. Try again.',
		});
	}
});

/** Route that list all today tasks for a user, except the finished ones.
 * filtered or not by category. If there's a problem doing the query,
 * it throws an error.
 */
router.get('/listTodayTasks/:categoryFilter', requireAuth, async (req, res) => {
	try {
		if (req.params.categoryFilter === 'All') {
			const tasks = await Task.find({
				userId: req.user._id,
				day: new Date().toLocaleString('en-GB', { weekday: 'long' }),
			})
				.sort({ creationDate: -1 })
				.where('category')
				.ne('Done');
			res.send(tasks);
		} else {
			const tasksFiltered = await Task.find({
				userId: req.user._id,
				category: req.params.categoryFilter,
				day: new Date().toLocaleString('en-GB', { weekday: 'long' }),
			}).sort({ creationDate: -1 });
			res.send(tasksFiltered);
		}
	} catch (error) {
		return res.status(422).send({
			Error: 'Something went wrong retrieving today tasks. Try again.',
		});
	}
});

/** Route that list all unique categories on the database.
 * If there's a problem doing the query, it throws an error.
 */
router.get('/listCategories', requireAuth, async (req, res) => {
	try {
		const categories = await Task.find().distinct('category');
		res.send(categories);
	} catch (error) {
		return res.status(422).send({
			Error: 'Something went wrong retrieving categories. Try again.',
		});
	}
});

/** Route that updates a task found by its id.
 * It makes use of the middleware checkFieldsToUpdate to detect the fields
 * to update.
 * */
router.post(
	'/updateTask',
	requireAuth,
	newTaskDataHandler,
	checkFieldsToUpdate,
	async (req, res) => {
		const taskId = req.body.taskId;
		let fieldsToUpdate = req.fieldsToUpdate;

		try {
			const task = await Task.findByIdAndUpdate(
				taskId,
				{ $set: { ...fieldsToUpdate } },
				{
					runValidators: true,
					new: true,
				}
			);
			res.send(task._id + ' succesfully updated.');
		} catch (error) {
			res.status(422).send({ error: error.message });
		}
	}
);

/** Route that delete a task found by its id. */
router.delete('/deleteTask', requireAuth, async (req, res) => {
	const taskId = req.body.taskId;

	try {
		const taskToDelete = await Task.findByIdAndDelete(taskId);
		res.send(taskToDelete._id + ' succesfully deleted.');
	} catch (error) {
		res.status(422).send({ error: error.message });
	}
});

module.exports = router;
