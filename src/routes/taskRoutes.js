const express = require('express');
const mongoose = require('mongoose');
const Task = mongoose.model('Task');
const requireAuth = require('../middlewares/requireAuth');
const checkFieldsToUpdate = require('../middlewares/checkFieldsToUpdate');

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

/** Route that lists all the tasks for a user, filtered or not by category.
 * If there's a problem doing the query, it throws an error.
 */
router.get('/listTasks/:categoryFilter', async (req, res) => {
	try {
		if (req.params.categoryFilter === 'allCategories') {
			const tasks = await Task.find({ userId: req.user._id });
			res.send(tasks);
		} else {
			const tasksFiltered = await Task.find({
				userId: req.user._id,
				category: req.params.categoryFilter,
			});

			res.send(tasksFiltered);
		}
	} catch (error) {
		return res.status(422).send({
			Error: 'Something went wrong retrieving tasks. Try again.',
		});
	}
});

/** Route that list all today tasks for a user, filtered or not by category.
 * If there's a problem doing the query, it throws an error.
 */
router.get('/listTodayTasks/:categoryFilter', async (req, res) => {
	try {
		if (req.params.categoryFilter === 'allCategories') {
			const tasks = await Task.find({
				userId: req.user._id,
				expirationDate: new Date().toISOString().slice(0, 10),
			});
			res.send(tasks);
		} else {
			const tasksFiltered = await Task.find({
				userId: req.user._id,
				category: req.params.categoryFilter,
				expirationDate: new Date().toISOString().slice(0, 10),
			});
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
router.get('/listCategories', async (req, res) => {
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
router.post('/updateTask', checkFieldsToUpdate, async (req, res) => {
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
});

/** Route that delete a task found by its id. */
router.delete('/deleteTask', async (req, res) => {
	try {
		const taskToDelete = await Task.findByIdAndDelete(req.body.taskId);
		res.send(taskToDelete._id + ' succesfully deleted.');
	} catch (error) {
		res.status(422).send({ error: error.message });
	}
});

module.exports = router;
