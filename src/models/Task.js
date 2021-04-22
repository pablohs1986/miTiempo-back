const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	day: {
		type: String,
		default: '',
	},
	duration: {
		type: Number,
		default: 0,
	},
	repeat: {
		type: String,
		default: '',
	},
	isPomodoro: {
		type: Boolean,
		default: false,
	},
	category: {
		type: String,
		default: 'Other',
	},
	color: {
		type: String,
		default: '#C830CC',
	},
	creationDate: {
		type: Date,
		default: new Date(),
	},
	isDone: {
		type: Boolean,
		default: false,
	},
});

mongoose.model('Task', taskSchema);
