const express = require('express')
const path = require('path')
const router = express.Router()
const multer = require('multer')
const upload = multer ({  }).single('file')
const mongoose = require('mongoose')
const IrrigateCauseV2 = require('../models/irrigateCauseV2')

//Send all the causes to the client
router.get('/api', async (req, res) => {
	let collection = await mongoose.connection.collection('causes')
	collection.find({	}).toArray((err, data) => {
		if (err) throw err
		res.json(data)
	})
})

//Save a cause in the database
router.post('/save', (req, res) => {
	upload(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			return res.status(500).json(err)
		} else if (err) {
			return res.status(500).json(err)
		}

		const newIrrigateCauseV2 = new IrrigateCauseV2({
			name: req.body.name,
			description: req.body.description,
			link: req.body.link,
			category: req.body.category,
			continent: req.body.continent,
			country: req.body.country,
			address: req.body.address,
			logoName : req.file.path,
			logo : req.body.logo64,
		})

		//Save application in pendingCauses collection
		let collection = mongoose.connection.collection('pendingCauses')
		collection.insertOne(newIrrigateCauseV2, (error) => {
			if (error) {
				res.status(500).json({ msg: 'Internal server error'})
			}
			res.status(201).json({
				message: 'Association saved'
			})
		})
	})
})

module.exports = router