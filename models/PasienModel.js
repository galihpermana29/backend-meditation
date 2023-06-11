const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PasienSchema = new Schema(
	{
		nik: { type: String, required: true, unique: true },
		noHp: { type: String, required: true },
		password: { type: String, required: true, select: false },
		noBpjs: { type: String, required: true, unique: true },
		name: { type: String, default: null },
		faskesSatu: { type: Schema.Types.ObjectId, ref: 'RumahSakit' },
		tempatLahir: { type: String, default: null },
		tanggalLahir: { type: String, default: null },
		alamatTinggal: { type: String, default: null },
		pekerjaan: { type: String, default: null },
		jenisKelamin: { type: String, default: null },
		// userStatus: { type: String },
	},
	{ timestamp: true }
);

module.exports = mongoose.model('Pasien', PasienSchema);
