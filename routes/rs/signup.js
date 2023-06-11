const express = require('express');
const router = express.Router();
const RumahSakit = require('../../models/RumahSakit');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
	const { rsName, rsCode, rsPassword } = req.body;

	//cek apakah password kurang dari 6
	if (rsPassword.length < 6)
		return res.status(401).send('Password must be atleast 6 characters');
	if (rsCode.length < 5)
		return res.status(401).send('RS Code must be atleast 5 characters');

	try {
		//cek apakah nobpjs sudah digunakan
		const checkRsCode = await RumahSakit.findOne({
			rsCode: rsCode.toLowerCase(),
		});
		if (checkRsCode) return res.status(401).send('RS Code Already Taken!');

		// encrypt password
		const pas = await bcrypt.hash(rsPassword, 10);

		// siapkan model data user yang mau di store ke database
		const userData = new RumahSakit({
			rsName,
			rsCode,
			rsPassword: pas,
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

module.exports = router;
