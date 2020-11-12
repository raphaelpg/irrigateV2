const mongoose = require('mongoose')
const Batch = require('../models/batch')

module.exports = {

	getBatchName:	async function () {
		console.log('getBatchName started')
		let currentDate = new Date()
		let currentYear = currentDate.getFullYear()
		let currentMonth = currentDate.getMonth()
		let currentDay = currentDate.getDate()
		if (currentDay < 15) {
			if (currentMonth === 1) {
				let batchName = currentYear + '_' + (11) + '_B'
				console.log("batchName: ", batchName)
				return batchName	
			} else if (currentMonth === 2) {
				let batchName = currentYear + '_' + (12) + '_B'
				console.log("batchName: ", batchName)
				return batchName
			} else {
				let batchName = currentYear + '_' + (currentMonth-1) + '_B'
				console.log("batchName: ", batchName)
				return batchName
			}
		} else {
			let batchName = currentYear + '_' + (currentMonth) + '_A'
			console.log("batchName: ", batchName)
			return batchName
		}
	},

	retrieveBatchCauses: async function (batchName) {
		console.log("retrieveBatchCauses started")
		const batchData = await Batch.find({ batch: batchName	})
		return batchData[0].causes
	},

	calculateBatchTotal: async function (batchCauses) {
		console.log("retrieveBatchTotal started")
		let totalAmount = 0  
		for (address in batchCauses) {
			totalAmount = totalAmount + parseInt(batchCauses[address])
		}
		return totalAmount.toString()
	},

	getNewBatchName: async function () {
		console.log('createNewBatch started')
		let currentDate = new Date()
		let currentYear = currentDate.getFullYear()
		let currentMonth = currentDate.getMonth()
		let currentDay = currentDate.getDate()

		if (currentDay < 15) {
				let newBatchName = currentYear + '_' + (currentMonth+1) + '_B'
				console.log("newBatchName: ", newBatchName)
				return newBatchName
		} else {
			if (currentMonth === 11) {
				let newBatchName = (currentYear+1) + '_' + (1) + '_A'
				console.log("newBatchName: ", newBatchName)
				return newBatchName
			} else {
				let newBatchName = currentYear + '_' + (currentMonth+2) + '_A'
				console.log("newBatchName: ", newBatchName)
				return newBatchName
			}
		}
	},

	createNewBatch: async function (newBatchName) {
		const batch = new Batch({
			_id: new mongoose.Types.ObjectId(),
			batch: newBatchName,
			causes: {
				"cause address": "0"
			}
		})
		let collection = mongoose.connection.collection('donations')
		collection.insertOne(batch, (error, result) => {
			if (error) {
				console.log(error)
			}
			console.log("New batch ", newBatchName, " created")
		})
	}
}