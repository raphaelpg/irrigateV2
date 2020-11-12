const mongoose = require('mongoose')
const AppParams = require('../models/appParams')
//Theses function are used to sign and make transaction from the second app address

const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const seed = process.env.SEED
const ropstenProvider = process.env.INFPROVIDER
const provider = new HDWalletProvider(seed, ropstenProvider, 1)
const web3 = new Web3(provider)

//Below addresses are ropsten
const irrigateAddress = '0xC1f1B00Ca70bB54a4d2BC95d07f2647889E2331a'
const irrigateInterestsAddress = '0xcFAe9CA007993F277943f318eB99334664162201'

const mockDaiContractAbi = require('../contracts/MockDAI.json')
const mockDaiContractAddress = '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108'
const mockDaiContractInstance = new web3.eth.Contract(mockDaiContractAbi, mockDaiContractAddress)

const LendingPoolAddressesProviderABI = require ('../contracts/LendingPoolAddressesProvider.json')
const lpAddressProviderAddress = '0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728'
const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressesProviderABI, lpAddressProviderAddress)

const LendingPoolABI = require ('../contracts/LendingPool.json')

const ADaiTokenABI = require('../contracts/ADaiToken.json')
const aDaiToken = '0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201'
const aDaiContract = new web3.eth.Contract(ADaiTokenABI, aDaiToken)

module.exports = {

	redeemInterests: async function(amoutToRedeem) {
		console.log("redeem interests function started")
		const amountInWei = web3.utils.toWei(amoutToRedeem, "ether").toString()

		async function redeem() {
			await aDaiContract.methods
	    .redeem(amountInWei)
	    .send({from: irrigateInterestsAddress})
	    .catch((e) => {
	      console.log(`Error redeeming aDai: ${e.message}`)
        console.log('Trying again')
        redeem()
	    })
	  }
	  await redeem()
	},

	getMonthParameters: async function () {
		console.log('getMonthParameters started')
		let currentDate = new Date()
		let currentYear = currentDate.getFullYear()
		let currentMonth = currentDate.getMonth()
		let currentParametersId = currentYear + '_' + (currentMonth+1)

		const collection = mongoose.connection.collection('appParams')
		return collection.findOne({ "name": 'monthlyNeedsParams' })
		.then(function(item) {
			return item['monthlyNeeds'][currentParametersId]
		})
	},

	getInterestsAmount: async function() {
		console.log("getInterestsAmount started")
		// return interests amount
		let interestsBalance = await aDaiContract.methods
	    .balanceOf(irrigateInterestsAddress)
	    .call({from: irrigateInterestsAddress})
	    .catch((e) => {
	        console.log(`Error retrieving interests balance: ${e.message}`)
	    })
		console.log("interestsBalance", interestsBalance/Math.pow(10, 18))
		console.log("getInterestsAmount ended")
		return interestsBalance/Math.pow(10, 18)
	},

	transferAllDaiToApp: async function() {
		console.log("transferAllDaiToApp function started")
		let daiBalance = await mockDaiContractInstance.methods.balanceOf(irrigateInterestsAddress).call({from: irrigateInterestsAddress})
		.catch((e) => {
	        console.log(`Error retrieving interests balance: ${e.message}`)
	    })

		async function transferToApp(daiBalance) {
			await mockDaiContractInstance.methods.transfer(irrigateAddress, daiBalance).send({from: irrigateInterestsAddress})
			.catch((e) => {
	      console.log(`Error transfering Dai: ${e.message}`)
        console.log('Trying again')
        transferToApp()
	    })
		}

	  await transferToApp()
	}

}