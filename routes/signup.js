const express = require('express');
const router = express.Router();
const PasienModel = require('../models/PasienModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
	const {
		name,
		noHp,
		password,
		noBpjs,
		nik,
		faskesSatu,
		jenisKelamin,
		tempatLahir,
		tanggalLahir,
		alamatTinggal,
		pekerjaan,
	} = req.body;

	//cek apakah no bpjs valid
	if (nik.length !== 16) return res.status(401).send('NIK Invalid');
	if (noBpjs.length !== 11) return res.status(401).send('No BPJS Invalid');

	//cek apakah password kurang dari 6
	if (password.length < 6)
		return res.status(401).send('Password must be atleast 6 characters');

	try {
		//cek apakah nobpjs sudah digunakan
		const checkBpjs = await PasienModel.findOne({
			noBpjs: noBpjs.toLowerCase(),
		});
		if (checkBpjs) return res.status(401).send('No BPJS Already Taken!');
		const checkNIK = await PasienModel.findOne({
			nik: nik.toLowerCase(),
		});
		if (checkNIK) return res.status(401).send('NIK Already Taken!');

		// encrypt password
		let pas;
		pas = await bcrypt.hash(password, 10);

		// siapkan model data user yang mau di store ke database
		const userData = new PasienModel({
			name,
			noHp,
			password: pas,
			noBpjs,
			nik,
			faskesSatu,
			jenisKelamin,
			tempatLahir,
			tanggalLahir,
			alamatTinggal,
			pekerjaan,
		});

		// simpan
		await userData.save();

		// bikin jwt
		const payload = { userId: userData._id };
		jwt.sign(
			payload,
			process.env.jwtSecret,
			{ expiresIn: '2d' },
			(err, token) => {
				if (err) throw err;
				res.status(200).json(token);
			}
		);
	} catch (err) {
		console.log(err);
		return res.status(500).send('Server Error with', err);
	}
});

router.put('/:userId', async (req, res) => {
	const id = req.params.userId;

	const {
		name,
		faskesSatu,
		jenisKelamin,
		tempatLahir,
		tanggalLahir,
		alamatTinggal,
		pekerjaan,
	} = req.body;

	const userData = new PasienModel({
		name,
		faskesSatu,
		jenisKelamin,
		tempatLahir,
		tanggalLahir,
		alamatTinggal,
		pekerjaan,
	});

	const upsertData = userData.toObject();
	delete upsertData._id;

	try {
		const query = { _id: id };
		const r = await PasienModel.findOneAndUpdate(query, upsertData, {
			upsert: true,
		});

		return res.status(200).send({
			status: 'OK',
			data: r,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server Error with', error);
	}
});

module.exports = router;
