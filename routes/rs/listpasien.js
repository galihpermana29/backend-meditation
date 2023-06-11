const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const PasienEvent = require('../../models/PasienEvent');
const PasienModel = require('../../models/PasienModel');
const RumahSakit = require('../../models/RumahSakit');
router.get('/list', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;
		const results = await PasienEvent.find({
			faskesActive: userId,
		}).sort({ _id: -1 });

		const query = req.query;
		const queryFields = Object.keys(query);

		const ps = await Promise.all(
			results.map(async (d) => {
				const pasien = await PasienModel.findById(d.user);
				const faskesSatu = await RumahSakit.findById(d.faskesSatu);
				const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
				const newData = {
					...d._doc,
					pasien,
					detailFaskesSatu: faskesSatu,
					detailFaskesRujukan: d.faskesRujukan === null ? null : faskesRujukan,
				};
				return newData;
			})
		);
		console.log(
			!queryFields.includes('status') &&
				queryFields.includes('name') &&
				query.name !== 'null'
		);
		console.log(query, queryFields, 'query');

		if (queryFields.length) {
			if (
				queryFields.includes('status') &&
				query.status !== 'null' &&
				queryFields.includes('name') &&
				query.name !== 'null'
			) {
				try {
					const ds = await PasienEvent.find({
						faskesActive: userId,
						eventStatus: query.status,
					});
					const ps = await Promise.all(
						ds.map(async (d) => {
							const pasien = await PasienModel.findById(d.user);
							const faskesSatu = await RumahSakit.findById(d.faskesSatu);
							const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
							const newData = {
								...d._doc,
								pasien,
								detailFaskesSatu: faskesSatu,
								detailFaskesRujukan:
									d.faskesRujukan === null ? null : faskesRujukan,
							};
							return newData;
						})
					);
					const newFiltered = ps.filter((d) =>
						d.pasien.name.toLowerCase().includes(query.name.toLowerCase())
					);

					return res.status(200).send({
						status: 'OK',
						data: newFiltered,
					});
				} catch (error) {
					return res.status(404).send('Not found');
				}
			} else if (
				!queryFields.includes('name') &&
				queryFields.includes('status')
			) {
				const ds = await PasienEvent.find({
					faskesActive: userId,
					eventStatus: query.status,
				});
				const ps = await Promise.all(
					ds.map(async (d) => {
						const pasien = await PasienModel.findById(d.user);
						const faskesSatu = await RumahSakit.findById(d.faskesSatu);
						const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
						const newData = {
							...d._doc,
							pasien,
							detailFaskesSatu: faskesSatu,
							detailFaskesRujukan:
								d.faskesRujukan === null ? null : faskesRujukan,
						};
						return newData;
					})
				);
				return res.status(200).send({
					status: 'OK',
					data: ps,
				});
			} else if (
				!queryFields.includes('status') &&
				queryFields.includes('name')
			) {
				const ds = await PasienEvent.find({
					faskesActive: userId,
				});
				const ps = await Promise.all(
					ds.map(async (d) => {
						const pasien = await PasienModel.findById(d.user);
						const faskesSatu = await RumahSakit.findById(d.faskesSatu);
						const faskesRujukan = await RumahSakit.findById(d.faskesRujukan);
						const newData = {
							...d._doc,
							pasien,
							detailFaskesSatu: faskesSatu,
							detailFaskesRujukan:
								d.faskesRujukan === null ? null : faskesRujukan,
						};
						return newData;
					})
				);

				const newFiltered = ps.filter((d) =>
					d.pasien.name.toLowerCase().includes(query.name.toLowerCase())
				);

				return res.status(200).send({
					status: 'OK',
					data: newFiltered,
				});
			}
		} else {
			console.log('pp');
			return res.status(200).send({
				status: 'OK',
				data: ps,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send('Error while getting the list of pasien');
	}
});

module.exports = router;
