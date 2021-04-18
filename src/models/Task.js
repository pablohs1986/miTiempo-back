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
	category: {
		type: String,
		default: 'General',
	},
	duration: {
		type: Number,
		default: 0,
	},
	repeat: {
		type: String,
		default: '',
	},
	color: {
		type: String,
		default: '#C830CC',
	},
	creationDate: {
		type: Date,
		default: new Date(),
	},
	expirationDate: {
		type: Date,
		default: null,
	},
	isPomodoro: {
		type: Boolean,
		default: false,
	},
	isDone: {
		type: Boolean,
		default: false,
	},
});

mongoose.model('Task', taskSchema);
