const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')
const cron = require('node-cron')
require('dotenv').config()

const app = express()
const routes = require('./routes/api')
const userRoutes = require('./routes/user')
// const donationsRoutes = require('./routes/donations')

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
// app.use('/donations', donationsRoutes)

//Superfluid protocol
const web3Functions = require('./functions/web3Functions')
// const aaveFunctions = require('./functions/aaveFunctions')
const causesFunctions = require('./functions/causesFunctions')
// const interestsFunctions = require('./functions/interestsFunctions')

async function launcher(indexID) {
	//Initialize superfluid and create an index
	await web3Functions.sfStart(indexID)
	// await web3Functions.sfCreateIndex(indexID)
	// await web3Functions.sfUpdateSubscription(indexID, '0x0A51e5F32dE5dE418eF54670b992F1cb75f80a65')
	// await web3Functions.sfApproveSubscription(indexID, '0x0A51e5F32dE5dE418eF54670b992F1cb75f80a65')
	// await web3Functions.sfDistributeDonations(indexID, 2000, 6)
	// await web3Functions.sfDowngradeTotal('0x1A7e2a64920B245F6951b674dFcc4105ea6d39f8')

	//Initialize aave and redirect interests
	//await web3Functions.aaveStart()
		//=> get DAI
		//=> deposit DAI
		//=> redirect interests to app second address

	//App redeem, distribute, deposit monthly function, launch each 1st of the month
	//Before execution, App balances: 
	// (X)aDAI, 
	// (Y)DAIx, 
	// (Z)DAI
	//1 Redeem Aave (X)aDAI to (X)DAI
	//2 Upgrade (X)DAI to (X)DAIx
	//3 Perform Instant Distribution of (X)DAIx
	//4 Downgrade (Y)DAIx to (Y)DAI
	//5 Deposit Aave (Z+Y)DAI to (Z+Y)aDAI

	//Redeel, distribute, stake function:
	cron.schedule('1 0 1 * *', async () => {
		console.log("redeem, distribute, stake operation started")

		/*let initialADaiBalance = await web3Functions.aaveGetADaiBalance()
		let initialDaixBalance = await web3Functions.sfAppGetDaixBalance()
		let initialDaiBalance = await web3Functions.sfAppGetDaiBalance()
		
		//1 Redeem Aave (X)aDAI to (X)DAI
		await web3Functions.aaveRedeemADai(initialADaiBalance)

		//2 Upgrade (X)DAI to (X)DAIx
		await web3Functions.sfAppUpgradeDaix(initialADaiBalance)

		//3 Perform Instant Distribution of (X)DAIx
		let numberOfReceivers = 4 //Retrieve number of receivers
		await web3Functions.sfDistributeDonations(indexID, initialADaiBalance, numberOfReceivers)

		//4 Downgrade (Y)DAIx to (Y)DAI
		await web3Functions.sfAppDowngradeAmount(initialDaixBalance)

		//5 Deposit Aave (Z+Y)DAI to (Z+Y)aDAI
		let depositDaiAmount = (initialDaixBalance + initialDaiBalance)
		await web3Functions.aaveAppDeposit(depositDaiAmount)*/
	})
}
launcher(1002)


//Heroku check
/*if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production_aws') {
	app.use(express.static('client/build'))
}*/

//Start server
app.listen(PORT, console.log(`Server listening on ${PORT}`))