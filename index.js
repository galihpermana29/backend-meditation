require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const routesLogin = require('./routes/login');
const routesSignup = require('./routes/signup');
const routesEvent = require('./routes/event');
const routesRSLogin = require('./routes/rs/login');
const routesRSSignup = require('./routes/rs/signup');
const routesRSLists = require('./routes/rs/listpasien');
const routesNotif = require('./routes/medical');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
	console.log(error);
});

database.once('connected', () => {
	console.log('Database Connected');
});
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/login', routesLogin);
app.use('/api/signup', routesSignup);
app.use('/api/rs/signup', routesRSSignup);
app.use('/api/rs', routesRSLogin);
app.use('/api/rs', routesRSLists);
app.use('/api/event', routesEvent);
app.use('/api/notif', routesNotif);

app.get('/', (req, res) => {
	return res.status(200).send('welcome');
});
app.listen(3000, () => {
	console.log(`Server Started at ${3000}`);
});
