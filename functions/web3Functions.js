//Web3
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

//Goerli
const goerliSeed = process.env.GOERLI_MNEMONIC
const goerliProvider = process.env.GOERLI_PROVIDER_URL
const provider = new HDWalletProvider(goerliSeed, goerliProvider)
const web3 = new Web3(provider)
const { toWad, toBN, fromWad, wad4human } = require("@decentral.ee/web3-helpers")

//Irrigate
const irrigateAddress = '0xfc94ffaf800fcf5b146ceb4fc1c37db604305ae5'
const irrigateInterestsAddress = ''

//Aave
// const mockDaiContractAbi = require('../contracts_old/MockDAI.json') //May not be needed
// const mockDaiContractAddress = '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108' //May not be needed
// const mockDaiContractInstance = new web3.eth.Contract(mockDaiContractAbi, mockDaiContractAddress) //May not be needed
const LendingPoolAddressesProviderABI = require ('../contracts_old/LendingPoolAddressesProvider.json')
const lpAddressProviderAddress = '0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728'//to deploy to goerli
// const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressesProviderABI, lpAddressProviderAddress)
const LendingPoolABI = require ('../contracts_old/LendingPool.json')
const ADaiTokenABI = require('../contracts_old/ADaiToken.json')
const aDaiToken = '0xcB1Fe6F440c49E9290c3eb7f158534c2dC374201'//to deploy to goerli
// const aDaiContract = new web3.eth.Contract(ADaiTokenABI, aDaiToken)

//Superfluid
const SuperfluidSDK = require("@superfluid-finance/ethereum-contracts");
const sf = new SuperfluidSDK.Framework({
  version: "0.1.2-preview-20201014", // This is for using different protocol release
  web3Provider: web3.currentProvider // your web3 provider
})

let daiAddress
let dai
let daixWrapper
let daix
let idaAddress
let idaContract

module.exports = {
	sfStart: async function(_indexID) {
		//init sf
		await sf.initialize()
		console.log("Superfluid initializing")

		//get addresses
		daiAddress = await sf.resolver.get("tokens.fDAI")
		dai = await sf.contracts.TestToken.at(daiAddress)
		daixWrapper = await sf.getERC20Wrapper(dai)
		daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
		console.log("Dai contract address: ", daiAddress)
		console.log("Daix wrapper address: ", daixWrapper.wrapperAddress)

		//check mock dai app's balance
		const daiBalance = wad4human(await dai.balanceOf(irrigateAddress))
		const daiBalanceTarget = 10100
		if (daiBalance < daiBalanceTarget) {
			let mintAmount = (daiBalanceTarget - daiBalance).toString() 
			dai.mint(irrigateAddress, web3.utils.toWei(mintAmount, "ether"), { from: irrigateAddress })	
			console.log("Dai minted")
		}
		const newDaiBalance = wad4human(await dai.balanceOf(irrigateAddress))
		console.log("Dai balance: ", newDaiBalance)

		//verify if daix is approved
		const daixAllowance = wad4human(await dai.allowance(irrigateAddress, daix.address))
		if (daixAllowance == 0) {
			dai.approve(daix.address, "1"+"0".repeat(42), { from: irrigateAddress })
			console.log("Daix approved")
		} else {
			console.log("Daix already approved")
		}

		//check if publishing index exists
		idaAddress = await sf.agreements.ida.address
		idaContract = await sf.contracts.IInstantDistributionAgreementV1.at(idaAddress)
		const indexID = _indexID
		const response = await idaContract.getIndex(daix.address, irrigateAddress, indexID)
		if (response.exist != true) {
			await sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.createIndex(daix.address, indexID, "0x").encodeABI(), { from: irrigateAddress })
			console.log("Publishing index created, id: ", indexID)
		} else {
			console.log("Publishing index exists, id: ", indexID)
		}
		console.log("Superfluid initialization successful")
	},

	sfApproveDaix: async function(_userAddress) {
		const daixAllowance = wad4human(await dai.allowance(_userAddress, daix.address))

		if (daixAllowance == 0) {
			dai.approve(daix.address, "1"+"0".repeat(42), { from: _userAddress })
			console.log("Daix approved")
		} else {
			console.log("Daix already approved")
		}
	},	

	sfUpgradeDaix: async function(_amount, _fromAddress) {
		await daix.upgrade(web3.utils.toWei(_amount, "ether"), { from: _fromAddress })
		console.log("daix upgraded by ", _amount, "from", _fromAddress)
	},

	sfAppUpgradeDaix: async function(_amount) {
		await daix.upgrade(web3.utils.toWei(_amount, "ether"), { from: irrigateAddress })
		console.log("daix upgraded by ", _amount, "from", irrigateAddress)
	},

	sfAppGetDaixBalance: async function() {
		let daixBalance = wad4human(await daix.balanceOf(irrigateAddress))
		return daixBalance
	},

	sfAppGetDaiBalance: async function() {
		let daiBalance = wad4human(await dai.balanceOf(irrigateAddress))
		return daiBalance
	},

	sfCreateIndex: async function(_indexNumber) {
		const response = await idaContract.getIndex(daix.address, irrigateAddress, _indexNumber)
		if (response.exist != true) {
			await sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.createIndex(daix.address, _indexNumber, "0x").encodeABI(), { from: irrigateAddress })
			console.log("Publishing index created, id: ", _indexNumber)
		} else {
			console.log("Publishing index exists, id: ", _indexNumber)
		}
	},

	sfUpdateSubscription: async function(_indexID, _causeAddress) {
		const indexID = _indexID
		await	sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.updateSubscription(daix.address, indexID, _causeAddress, 1, "0x").encodeABI(), { from: irrigateAddress })
		console.log(_causeAddress, " subscribed to index ", _indexID)
	},

	sfApproveSubscription: async function(_indexID, _causeAddress) {
		const indexID = _indexID
		await	sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.approveSubscription(daix.address, irrigateAddress, indexID, "0x").encodeABI(), { from: _causeAddress })
		console.log(_causeAddress, " approved to index ", _indexID)
	},

	sfDeleteSubscription: async function(_indexID, _causeAddress) {
		const indexID = _indexID
		await	sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.deleteSubscription(daix.address, irrigateAddress, indexID, _causeAddress, "0x").encodeABI(), { from: irrigateAddress })
		console.log(_causeAddress, " subscribtion deleted from index ", _indexID)
	},

	sfDistributeDonations: async function(_indexID, _amount, _causesCount) {
		const indexID = _indexID
		const totalAmount = _amount.toString()
		const individualAmount = Math.floor(_amount/_causesCount).toString()
		daix.upgrade(web3.utils.toWei(totalAmount, "ether"), { from: irrigateAddress })
		console.log("Daix upgraded")
		sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.updateIndex(daix.address, indexID, web3.utils.toWei(individualAmount, "ether"), "0x").encodeABI(), { from: irrigateAddress })
		console.log(individualAmount, "daix sent to each", _causesCount, "causes")
		console.log("Donations distributed")
	},

	sfDowngradeTotal: async function(_causeAddress) {
		const causeBalance = wad4human(await daix.balanceOf(_causeAddress))
		console.log("Cause balance",causeBalance, "daix")
		await daix.downgrade(web3.utils.toWei(causeBalance, "ether"), { from: _causeAddress })
		console.log(causeBalance, "daix downgraded")
		const causeBalanceDai = wad4human(await dai.balanceOf(_causeAddress))
		console.log("New cause Dai balance: ",causeBalanceDai)
	},

	sfAppDowngradeAmount: async function(_amount) {
		await daix.downgrade(web3.utils.toWei(_amount, "ether"), { from: irrigateAddress })
		console.log(causeBalance, "daix downgraded")
	},

	aaveGetADaiBalance: async() => {
		console.log("Retrieving balance")
		const aDaiBalance = await aDaiContract.balance0f(irrigateAddress)
		return aDaiBalance
	},

	aaveDepositToLP: async function () {
		console.log("depositToLP started")
		//make a deposit to aave lending pool of all DAIs in app account
		const appMockDaiBalance = await mockDaiContractInstance.methods.balanceOf(irrigateAddress).call()
		const appMockDaiBalanceinWei = appMockDaiBalance.toString()
		const referralCode = '0'

		//Get the latest LendingPoolCore address
		async function aaveGetLpCoreAddress() {
			return await lpAddressProviderContract.methods.getLendingPoolCore().call()
	    .catch((e) => {
        console.log(`Error getting lendingPool address: ${e.message}`)
        console.log('Trying again')
	  		lpCoreAddress()
	    })
	  }
	  const lpCoreAddress = await aaveGetLpCoreAddress()

	  //Approve the LendingPoolCore address with the DAI contract
		async function aaveApproveLpCoreAddress() {
			await mockDaiContractInstance.methods
	    .approve(
	        lpCoreAddress,
	        appMockDaiBalanceinWei
	    )
	    .send({from: irrigateAddress})
	    .catch((e) => {
	      console.log(`Error approving DAI allowance: ${e.message}`)
        console.log('Trying again')
        aaveApproveLpCoreAddress()
	    })
	  }
	  await aaveApproveLpCoreAddress()

	  //Get the latest LendingPool contract address
		async function aaveGetLendingPoolAddress() {
			return await lpAddressProviderContract.methods
	    .getLendingPool()
	    .call({from: irrigateAddress})
	    .catch((e) => {
	      console.log(`Error getting lendingPool address: ${e.message}`)
        console.log('Trying again')
        aaveGetLendingPoolAddress()
	    })
	  } 
	  const lpAddress = await aaveGetLendingPoolAddress()

	  //Make the deposit transaction via LendingPool contract
		const lpContract = new web3.eth.Contract(LendingPoolABI, lpAddress)
		async function aaveDepositAllDai() {
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
        aaveDepositAllDai()
	    })
	  }
	  await aaveDepositAllDai()

	},

	aaveAppDeposit: async(_amount) => {
		console.log(_amount, "DAI deposited")
	},

	aaveRedeemADai: async(amoutToRedeem) => {
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

	aaveTransferToCauses: async function(addressesArray) {
		console.log("Transfer to causes started")

		async function aaveTransferToOneCause(causeAddress, causeAddressAmount) {
		  	await mockDaiContractInstance.methods.transfer(causeAddress, causeAddressAmount).send({from: irrigateAddress})
		  	.catch((e) => {
		      console.log(`Error transfering Dai: ${e.message}`)
	        console.log('Trying again')
	        aaveTransferToOneCause()
		    })
		  }

		for (address in addressesArray) {
			const addressAmount = web3.utils.toWei(addressesArray[address], "ether").toString()
		  console.log("Transfering ",addressAmount, "DAI to ", address)
		  
		  await aaveTransferToOneCause(address, addressAmount)
		}
		console.log("All transfers to causes ended")
	},

	aaveRedirectInterests: async function() {
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