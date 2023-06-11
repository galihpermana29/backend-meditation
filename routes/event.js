const express = require('express');
const router = express.Router();
const moment = require('moment');

const EventModel = require('../models/PasienEvent');

const authMiddleware = require('../middleware/auth');
const RumahSakit = require('../models/RumahSakit');
const PasienEvent = require('../models/PasienEvent');
const PasienModel = require('../models/PasienModel');

router.post('/', authMiddleware, async (req, res) => {
	const { userId } = req;
	const {
		poliklinik,
		tanggalKunjungan,
		jaminanPembiayaan,
		faskesSatu,
		faskesRujukan,
		eventStatus,
	} = req.body;

	try {
		const eventData = new EventModel({
			poliklinik,
			tanggalKunjungan,
			jaminanPembiayaan,
			faskesSatu,
			faskesRujukan,
			eventStatus,
			user: userId,
			faskesActive: faskesSatu,
		});

		// simpan
		await eventData.save();
		return res.status(200).send({
			status: 'OK',
			data: eventData,
		});
	} catch (error) {
		return res.status(500).send('Server Error with', err);
	}
});

router.put('/change-status/:eventId', authMiddleware, async (req, res) => {
	const eventId = req.params.eventId;
	const { eventStatus, faskesSatu, faskesRujukan } = req.body; // terdaftar, dirawat di faskes 1, dirawat di faskes 2, selesai
	const r = await PasienEvent.findById(eventId);
	const userData = new PasienEvent({
		...r._doc,
		eventStatus,
		faskesRujukan,
		...(eventStatus === 'dirawat di faskes 1' && { faskesActive: faskesSatu }),
		...(eventStatus === 'selesai' && {
			tanggalKeluar: moment().format('YYYY-MM-DD'),
		}),
		...(eventStatus === 'dirawat di faskes 2' && {
			faskesActive: faskesRujukan,
		}),
	});

	const upsertData = userData.toObject();
	delete upsertData._id;

	try {
		const query = { _id: eventId };
		const r = await PasienEvent.findOneAndUpdate(query, upsertData, {
			upsert: true,
		});
		return res.status(200).send({
			status: 'OK',
			data: r,
		});
	} catch (error) {
		return res.status(500).send('Server Error with', err);
	}
});

router.get('/', authMiddleware, async (req, res) => {
	const { userId } = req;
	const query = req.query;
	const queryFields = Object.keys(query);
	let eventData = await EventModel.find({ user: userId }).sort({ _id: -1 });
	const ps = await Promise.all(
		eventData.map(async (d) => {
			const faskesSatu = await RumahSakit.findById(d.faskesSatu);
			const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
			const newData = {
				detailFaskesSatu: faskesSatu,
				detailFaskesRujukan: d.faskesRujukan === null ? null : faskesRujukan,
				...d._doc,
			};
			return newData;
		})
	);

	try {
		if (queryFields.length) {
			if (queryFields.includes('id') && query.id !== 'null') {
				try {
					const d = await EventModel.findById(query.id);
					const faskesSatu = await RumahSakit.findById(d.faskesSatu);
					const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
					const newData = {
						detailFaskesSatu: faskesSatu,
						detailFaskesRujukan:
							d.faskesRujukan === null ? null : faskesRujukan,
						...d._doc,
					};
					return res.status(200).send({
						status: 'OK',
						data: [newData],
					});
				} catch (error) {
					return res.status(404).send('Not found');
				}
			} else if (queryFields.includes('status') && query.status !== 'null') {
				try {
					const ds = await EventModel.find({
						user: userId,
						eventStatus: query.status,
					});
					const ps = await Promise.all(
						ds.map(async (d) => {
							const faskesSatu = await RumahSakit.findById(d.faskesSatu);
							const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
							const newData = {
								detailFaskesSatu: faskesSatu,
								detailFaskesRujukan:
									d.faskesRujukan === null ? null : faskesRujukan,
								...d._doc,
							};
							return newData;
						})
					);
					return res.status(200).send({
						status: 'OK',
						data: ps,
					});
				} catch (error) {
					return res.status(404).send('Not found');
				}
			} else if (query.id === 'null' || query.status === 'null') {
				return res.status(200).send({
					status: 'OK',
					data: ps,
				});
			}
		} else {
			return res.status(200).send({
				status: 'OK',
				data: ps,
			});
		}
	} catch (error) {
		return res.status(500).send('Server Error with', error);
	}
});

router.get('/:eventId', authMiddleware, async (req, res) => {
	const id = req.params.eventId;
	try {
		let eventData = await EventModel.findById(id);
		let newData;
		const pasien = await PasienModel.findById(eventData.user);
		const faskesSatu = await RumahSakit.findById(eventData.faskesSatu);
		const faskesRujukan = await RumahSakit.findById(eventData.faskesRujukan);
		newData = {
			pasien,
			detailFaskesSatu: faskesSatu,
			detailFaskesRujukan:
				eventData.faskesRujukan === null ? null : faskesRujukan,
			...eventData._doc,
		};

		return res.status(200).send({
			status: 'OK',
			data: newData,
		});
	} catch (error) {
		return res.status(500).send('Server Error with', error);
	}
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
	const id = req.params.userId;
	try {
		let eventData = await EventModel.find({ user: id });
		const ps = await Promise.all(
			eventData.map(async (d) => {
				const faskesSatu = await RumahSakit.findById(d.faskesSatu);
				const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
				const newData = {
					detailFaskesSatu: faskesSatu,
					detailFaskesRujukan: d.faskesRujukan === null ? null : faskesRujukan,
					...d._doc,
				};
				return newData;
			})
		);

		return res.status(200).send({
			status: 'OK',
			data: ps,
		});
	} catch (error) {
		return res.status(500).send('Server Error with', error);
	}
});

module.exports = router;
