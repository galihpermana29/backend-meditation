const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PasienEventSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'Pasien' },
		poliklinik: { type: String },
		tanggalKunjungan: { type: String, required: true },
		jaminanPembiayaan: { type: String },
		faskesSatu: { type: Schema.Types.ObjectId, ref: 'RumahSakit' },
		faskesRujukan: {
			type: Schema.Types.ObjectId,
			ref: 'RumahSakit',
			default: null,
		},
    faskesActive: {
			type: Schema.Types.ObjectId,
			ref: 'RumahSakit',
			default: null,
		},
		eventStatus: { type: String },
		tanggalKeluar: { type: String, default: null },
		medicalHide: { type: Boolean, default: true },
	},
	{ timestamp: true }
);

// PasienEventSchema.index({ _id: 'text', eventStatus: 'text' });

module.exports = mongoose.model('Event', PasienEventSchema);
