const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RumahSakit = new Schema(
	{
		rsName: { type: String, required: true },
		rsCode: { type: String, required: true, unique: true },
		rsPassword: { type: String, required: true, select: false },
	},
	{ timestamp: true }
);

module.exports = mongoose.model('RumahSakit', RumahSakit);
