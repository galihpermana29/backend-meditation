const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
	try {
		//jika request yang masuk ga mengirimkan authorization header
		if (!req.headers.authorization) {
			return res.status(401).send('Unauthorized');
		}

		const parsing = req.headers.authorization.split(' ')[1];
		//verifikasi jwt token yang dikirim dari header authorization
		const { userId } = jwt.verify(parsing, process.env.jwtSecret);
		req.userId = userId;
		next();
	} catch (error) {
		console.error(error);
		return res.status(401).send('Unauthorized');
	}
};
