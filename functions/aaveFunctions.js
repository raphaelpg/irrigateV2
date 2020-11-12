const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const seed = process.env.SEED
const ropstenProvider = process.env.INFPROVIDER
const provider = new HDWalletProvider(seed, ropstenProvider)
const web3 = new Web3(provider)

//All below adresses are ropsten
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

	depositToLP: async function () {
		console.log("depositToLP started")
		//make a deposit to aave lending pool of all DAIs in app account
		const appMockDaiBalance = await mockDaiContractInstance.methods.balanceOf(irrigateAddress).call()
		const appMockDaiBalanceinWei = appMockDaiBalance.toString()
		const referralCode = '0'

		//Get the latest LendingPoolCore address
		async function getLpCoreAddress() {
			return await lpAddressProviderContract.methods.getLendingPoolCore().call()
	    .catch((e) => {
        console.log(`Error getting lendingPool address: ${e.message}`)
        console.log('Trying again')
	  		lpCoreAddress()
	    })
	  }
	  const lpCoreAddress = await getLpCoreAddress()

	  //Approve the LendingPoolCore address with the DAI contract
		async function approveLpCoreAddress() {
			await mockDaiContractInstance.methods
	    .approve(
	        lpCoreAddress,
	        appMockDaiBalanceinWei
	    )
	    .send({from: irrigateAddress})
	    .catch((e) => {
	      console.log(`Error approving DAI allowance: ${e.message}`)
        console.log('Trying again')
        approveLpCoreAddress()
	    })
	  }
	  await approveLpCoreAddress()

	  //Get the latest LendingPool contract address
		async function getLendingPoolAddress() {
			return await lpAddressProviderContract.methods
	    .getLendingPool()
	    .call({from: irrigateAddress})
	    .catch((e) => {
	      console.log(`Error getting lendingPool address: ${e.message}`)
        console.log('Trying again')
        getLendingPoolAddress()
	    })
	  } 
	  const lpAddress = await getLendingPoolAddress()

	  //Make the deposit transaction via LendingPool contract
		const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress)
		async function depositAllDai() {
			await lpContract.methods
	    .deposit(
        mockDaiContractAddress,
        appMockDaiBalanceinWei,
        referralCode
	    )
	    .send({from: irrigateAddress})
	    .catch((e) => {
        console.log(`Error depositing to the LendingPool contract: ${e.message}`)
        console.log('Trying again')
        depositAllDai()
	    })
	  }
	  await depositAllDai()

	},

	redeemADai: async function(amoutToRedeem) {
		console.log("redeemADai function started")
		const amountInWei = web3.utils.toWei(amoutToRedeem, "ether").toString()

		async function redeem() {
			await aDaiContract.methods
	    .redeem(amountInWei)
	    .send({from: irrigateAddress})
	    .catch((e) => {
	      console.log(`Error redeeming aDai: ${e.message}`)
        console.log('Trying again')
        redeem()
	    })
	  }
	  await redeem()
	}, 

	transferToCauses: async function(addressesArray) {
		console.log("Transfer to causes started")

		async function transferToOneCause(causeAddress, causeAddressAmount) {
		  	await mockDaiContractInstance.methods.transfer(causeAddress, causeAddressAmount).send({from: irrigateAddress})
		  	.catch((e) => {
		      console.log(`Error transfering Dai: ${e.message}`)
	        console.log('Trying again')
	        transferToOneCause()
		    })
		  }

		for (address in addressesArray) {
			const addressAmount = web3.utils.toWei(addressesArray[address], "ether").toString()
		  console.log("Transfering ",addressAmount, "DAI to ", address)
		  
		  await transferToOneCause(address, addressAmount)
		}
		console.log("All transfers to causes ended")
	},

	redirectInterests: async function() {
		console.log("redirectInterests started")
		// redirect interest stream to a different address
		const to = irrigateInterestsAddress
		await aDaiContract.methods
		    .redirectInterestStream(to)
		    .send({from: irrigateAddress})
		    .catch((e) => {
		        throw Error(`Error redeeming Dai: ${e.message}`)
		    })
		console.log("redirectInterests ended")
	}

}