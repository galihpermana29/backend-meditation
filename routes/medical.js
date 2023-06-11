const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const NotifikasiPasien = require('../models/NotifikasiPasien');
const PasienEvent = require('../models/PasienEvent');

router.post('/', authMiddleware, async (req, res) => {
	try {
		const { eventId, pasienId, title, desc } = req.body;
		const userData = new NotifikasiPasien({
			user: pasienId,
			event: eventId,
			title,
			desc,
			...(title === 'medical permission' && { medicRecordVisibility: null }),
		});

		// simpan
		await userData.save();
		return res.status(200).send({
			status: 'OK',
		});
	} catch (error) {
		console.log(error);
		res.status(500).send('Error while getting the list of pasien');
	}
});

router.get('/', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		let eventData = await NotifikasiPasien.find({ user: userId }).sort({
			_id: -1,
		});
		return res.status(200).send({
			status: eventData,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send('Error while getting the list of pasien');
	}
});

router.put('/:notifId', authMiddleware, async (req, res) => {
	try {
		const id = req.params.notifId;

		const { medicalStatus } = req.body;

		const userData = new NotifikasiPasien({
			medicRecordVisibility: medicalStatus,
		});

		const upsertData = userData.toObject();
		delete upsertData._id;

		const query = { _id: id };
		const r = await NotifikasiPasien.findOneAndUpdate(query, upsertData, {
			upsert: true,
		});
		const dd = await PasienEvent.findById(r.event);

		const eventData = new PasienEvent({
			medicalHide: !medicalStatus,
			faskesActive: dd.faskesActive,
			faskesRujukan: dd.faskesRujukan,
			faskesSatu: dd.faskesSatu,
		});

		const upsertEventData = eventData.toObject();
		delete upsertEventData._id;
		const queryEvent = { _id: r.event };

		const p = await PasienEvent.findOneAndUpdate(queryEvent, upsertEventData, {
			upsert: true,
		});
		// simpan
		return res.status(200).send({
			status: 'OK',
		});
	} catch (error) {
		console.log(error);
		res.status(500).send('Error while getting the list of pasien');
	}
});

module.exports = router;
