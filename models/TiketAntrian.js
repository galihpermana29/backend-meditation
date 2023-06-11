const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TiketAntrian = new Schema(
	{
		event: { type: Schema.Types.ObjectId, ref: 'Event' },
		nomorAntrian: { type: String },
	},
	{ timestamp: true }
);

module.exports = mongoose.model('Tiket', TiketAntrian);
