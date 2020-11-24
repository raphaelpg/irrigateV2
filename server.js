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

//Superfluid protocol
const web3Functions = require('./functions/web3Functions')
const aaveFunctions = require('./functions/aaveFunctions')
const causesFunctions = require('./functions/causesFunctions')
const interestsFunctions = require('./functions/interestsFunctions')

async function launcher(indexID) {
	//Initialize superfluid and create an index
	await web3Functions.sfStart(indexID)
	// await web3Functions.sfCreateIndex(indexID)
	// await web3Functions.sfUpdateSubscription(indexID, '0x0A51e5F32dE5dE418eF54670b992F1cb75f80a65')
	// await web3Functions.sfApproveSubscription(indexID, '0x0A51e5F32dE5dE418eF54670b992F1cb75f80a65')
	// await web3Functions.sfDistributeDonations(indexID, 2000, 6)
	// await web3Functions.sfDowngradeTotal('0x1A7e2a64920B245F6951b674dFcc4105ea6d39f8')

	//App redeem, distribute, deposit monthly function, launch each 1st of the month
	//Before function, App balances: 
	// X(aDAI), 
	// Y(DAIx), 
	// Z(DAI)
	//1 Redeem Aave aDAI to DAI
	//2 Upgrade DAI to DAIx
	//3 Perform Instant Distribution of DAIx
	//4 Downgrade DAIx to DAI
	//5 Deposit Aave DAI to aDAI

	//Function for batch time management, launched each 1st and 15th of every month at 00h01:
	//Redeem DAIs, perform transfers, deposit DAIs
	//A batch is an Object store in MongoDB database that contains all the projects addresses that have received funds and the corresponding
	//total funds they received during a period of 15 days.
	//For example June 2020 has two batch, A and B. Batch A named 2020_6_A from 1st to 14th and Batch B named 2020_6_B from 15th to 30th. 
/*	cron.schedule('1 0 1,15 * *', async () => {
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
	});*/

	//Function for interests management, launched each 1st of every month at 01h01:
/*	cron.schedule('1 1 1 * *', async () => {
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
	})*/
}
launcher(1002)


//Heroku check
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))
}

//Start server
app.listen(PORT, console.log(`Server listening on ${PORT}`))