const express = require('express')
const path = require('path')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Batch = require('../models/batch')
const upload = multer ({  }).single('file')
const checkAuth = require('../middleware/check-auth')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
require('dotenv').config()

const seed = process.env.SEED
const ropstenProvider = process.env.INFPROVIDER
const provider = new HDWalletProvider(seed, ropstenProvider)
const web3 = new Web3(provider)
const irrigateAddress = '0xC1f1B00Ca70bB54a4d2BC95d07f2647889E2331a'
const mockDaiContractAbi = require('../contracts/MockDAI.json')
const mockDaiContractAddress = '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108'
const mockDaiContractInstance = new web3.eth.Contract(mockDaiContractAbi, mockDaiContractAddress)

//Return the name of the current batch  
function getCurrentBatchName() {
	let currentDate = new Date()
	let currentYear = currentDate.getFullYear()
	let currentMonth = currentDate.getMonth()
	let currentDay = currentDate.getDate()
	if (currentDay < 15) {
		let batchName = currentYear + '_' + (currentMonth+1) + '_A'
		console.log("batchName: ", batchName)
		return batchName 
	} else {
		let batchName = currentYear + '_' + (currentMonth+1) + '_B'
		console.log("batchName: ", batchName)
		return batchName
	}
}

//Save a donation to the batch
router.post('/donateOnce', (req, res, next) => {
	upload(req, res, async function(err) {
		if (err instanceof multer.MulterError) {
			return res.status(500).json(err)
		} else if (err) {
			return res.status(500).json(err)
		}
		const receivedAmount = parseInt(req.body.amount)/Math.pow(10, 18)
		const causeAddress = req.body.causeAddress
		const currentBatch = await getCurrentBatchName()

		let collection = mongoose.connection.collection('donations')
		collection.find({ batch: currentBatch }).toArray((err, data) => {
			if (err) {
				return res.status(401).json({
			 		message: 'database access failed'
				})
			}
			if (data[0].causes[causeAddress]) {
				console.log("cause found in current batch")
				const newAmount = parseInt(data[0].causes[causeAddress]) + receivedAmount
				let newData = data
				newData[0].causes[causeAddress] = newAmount.toString()
			  const myquery = { "batch": currentBatch }
			  const newvalues = { $set: {"causes": newData[0].causes }}
			  collection.updateOne(myquery, newvalues, function(err, response) {
				  if (err) {
						console.log(err)
						return res.status(500).json({
							error: err
						})
					}
					console.log("funds added")
					return res.status(201).json({
						message: 'amount added to causes fund'
					})
				})
			} else {
				console.log("cause not found in current batch, creating")
				let newData = data
				newData[0].causes[causeAddress] = receivedAmount.toString()
				const myquery = { "batch": currentBatch }
			  const newvalues = { $set: {"causes": newData[0].causes} }
			  collection.updateOne(myquery, newvalues, function(err, response) {
			  	if (err) {
						console.log(err)
						return res.status(500).json({
							error: err
						})
					}
					console.log("cause and funds added")
					return res.status(201).json({
						message: 'cause and fund created'
					})
				})
			}
		})
	})
})

//Transfer DAI to cause
router.post('/sendToCause', (req, res, next) => {
	upload(req, res, async function(err) {
		if (err instanceof multer.MulterError) {
			return res.status(500).json(err)
		} else if (err) {
			return res.status(500).json(err)
		}
		const receivedAmount = req.body.amount
		const causeAddress = req.body.causeAddress
		await mockDaiContractInstance.methods.transfer(causeAddress, receivedAmount).send({from: irrigateAddress})
		.then(() => {
			console.log("transfered to cause")
			return res.status(200).json({
				message: 'transfered to cause',
			})
		})
		.catch(error => {
			console.log("transfer to cause failed", error)
			return res.status(401).json({
				message: 'transder to cause failed'
			})
		})
	})
})



module.exports = router