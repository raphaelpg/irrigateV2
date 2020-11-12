const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')
const cron = require('node-cron')
require('dotenv').config()

const app = express()
const routes = require('./routes/api')
const userRoutes = require('./routes/user')
const donationsRoutes = require('./routes/donations')

const aaveFunctions = require('./functions/aaveFunctions')
const causesFunctions = require('./functions/causesFunctions')
const interestsFunctions = require('./functions/interestsFunctions')

//Database connection
const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})

mongoose.connection.on('connected', () => {
	console.log('Mongoose is connected')
})

//Data parsing
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/ressources', express.static('ressources'))

//Routes logs in console
app.use(morgan('tiny'))
//Use router
app.use('/', routes)
app.use('/user', userRoutes)
app.use('/donations', donationsRoutes)

//Function for batch time management, launched each 1st and 15th of every month at 00h01:
//Redeem DAIs, perform transfers, deposit DAIs
//A batch is an Object store in MongoDB database that contains all the projects addresses that have received funds and the corresponding
//total funds they received during a period of 15 days.
//For example June 2020 has two batch, A and B. Batch A named 2020_6_A from 1st to 14th and Batch B named 2020_6_B from 15th to 30th. 
cron.schedule('1 0 1,15 * *', async () => {
	//1.Create new batch to register causes donations
		//get new batch name
		const newBatchName = await causesFunctions.getNewBatchName()
		//create new batch
		await causesFunctions.createNewBatch(newBatchName)

	//2.Retrieve batch from 6 weeks ago to redistribute donations
		//get corresponding causes and their amount
		const batchToRetrieve = await causesFunctions.getBatchName()
		//retrieve addresses and amounts
		const batchCauses = await causesFunctions.retrieveBatchCauses(batchToRetrieve)
		//total amount to redeem for this batch
		const totalAmount = await causesFunctions.calculateBatchTotal(batchCauses)

	//3.Redeem all the aDAIs to aave and get the DAIs back
	await aaveFunctions.redeemADai(totalAmount)
			
	//4.Transfer to each cause the correct amount
	await aaveFunctions.transferToCauses(batchCauses)

	//5.Make a deposit to aave lending pool of all DAIs in app account	
	await aaveFunctions.depositToLP()
});

//Function for interests management, launched each 1st of every month at 01h01:
cron.schedule('1 1 1 * *', async () => {
	const interestsBalance = await interestsFunctions.getInterestsAmount()

	interestsFunctions.getMonthParameters().then(async function(monthNeeds) {
		
		if (monthNeeds < interestsBalance) {
			console.log("enough and redistribute, ", monthNeeds , "<", interestsBalance)
			//Retrieve batch from 6 weeks ago to redistribute donations
			//get corresponding causes and their amount
			const batchToRetrieve = await causesFunctions.getBatchName()
			//retrieve addresses and amounts
			const batchCauses = await causesFunctions.retrieveBatchCauses(batchToRetrieve)
			//transfer monthneeds to app

			//redistribute rest to causes TBD

		} else {
			console.log("not enough interests, ", monthNeeds , ">", interestsBalance)
				await interestsFunctions.redeemInterests(interestsBalance.toString())
				await interestsFunctions.transferAllDaiToApp()
		}

	}, function(err) {
	  console.error('The promise was rejected', err, err.stack);
	});

})

//Heroku check
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))
}

//Start server
app.listen(PORT, console.log(`Server listening on ${PORT}`))