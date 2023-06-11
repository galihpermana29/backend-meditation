const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotifikasiPasien = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'Pasien' },
		event: { type: Schema.Types.ObjectId, ref: 'PasienEvent' },
		title: { type: String },
		desc: { type: String },
		medicRecordVisibility: { type: Boolean, default: undefined },
	},
	{ timestamp: true }
);

module.exports = mongoose.model('NotifikasiPasien', NotifikasiPasien);
