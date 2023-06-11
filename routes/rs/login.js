const express = require('express');
const router = express.Router();
const RumahSakit = require('../../models/RumahSakit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../../middleware/auth');

router.get('/all-rs', authMiddleware, async (req, res) => {
	try {
		const user = await RumahSakit.find();
		return res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server ERROR');
	}
});

router.get('/login', authMiddleware, async (req, res) => {
	//req yang masuk sama kaya req di middleware bedanya, dia udah punya key userId yang di isi di middleware yang merupakan id user hasil verif jwt
	const { userId } = req;

	try {
		const user = await RumahSakit.findById(userId);
		return res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		return res.status(500).send('Server ERROR');
	}
});

router.post('/login', async (req, res) => {
	const { rsCode, rsPassword } = req.body;
	//cek apakah password kurang dari 6
	if (rsPassword.length < 6)
		return res.status(401).send('Password must be atleast 6 characters');
	if (rsCode.length < 5)
		return res.status(401).send('RS Code must be atleast 5 characters');

	try {
		//cek apakah nik ada di database?
		const User = await RumahSakit.findOne({
			rsCode: rsCode.toLowerCase(),
		}).select('+rsPassword');
		const isPassword = await bcrypt.compare(rsPassword, User.rsPassword);

		if (!User) return res.status(401).send('Wrong code!');
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
