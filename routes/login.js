const express = require('express');
const router = express.Router();
const PasienModel = require('../models/PasienModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
	//req yang masuk sama kaya req di middleware bedanya, dia udah punya key userId yang di isi di middleware yang merupakan id user hasil verif jwt
	const { userId } = req;

	try {
		const user = await PasienModel.findById(userId);
		//return user dan followstatsnya
		return res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server ERROR');
	}
});

router.post('/', async (req, res) => {
	const { nik, password } = req.body;

	//cek apakah email valid
	if (nik.length !== 16) return res.status(401).send('NIK is invalid');

	//cek apakah password kurang dari 6
	if (password.length < 6)
		return res.status(401).send('Password must be atleast 6 characters');

	try {
		//cek apakah nik ada di database?
		const User = await PasienModel.findOne({
			nik: nik.toLowerCase(),
		}).select('+password');

		if (!User) return res.status(401).send('Wrong NIK!');
		const isPassword = await bcrypt.compare(password, User.password);
		if (!isPassword) return res.status(401).send('Wrong password!');

		// bikin jwt
		const payload = { userId: User._id };
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

module.exports = router;
