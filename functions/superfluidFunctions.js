const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const goerliSeed = process.env.GOERLI_MNEMONIC
const goerliProvider = process.env.GOERLI_PROVIDER_URL
const provider = new HDWalletProvider(goerliSeed, goerliProvider)
// const seed = process.env.SEED
// const ropstenProvider = process.env.INFPROVIDER
// const provider = new HDWalletProvider(seed, ropstenProvider)
const web3 = new Web3(provider)
const { toWad, toBN, fromWad, wad4human } = require("@decentral.ee/web3-helpers")
const irrigateAddress = '0xfc94ffaf800fcf5b146ceb4fc1c37db604305ae5'

const SuperfluidSDK = require("@superfluid-finance/ethereum-contracts");
const sf = new SuperfluidSDK.Framework({
    version: "0.1.2-preview-20201014", // This is for using different protocol release
    web3Provider: web3.currentProvider // your web3 provider
})

module.exports = {

	sfStart: async function() {
		//init sf
		await sf.initialize()
		console.log("Superfluid initialized")

		//get addresses
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const daixWrapper = await sf.getERC20Wrapper(dai)
		const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
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
		const idaAddress = await sf.agreements.ida.address
		const idaContract = await sf.contracts.IInstantDistributionAgreementV1.at(idaAddress)
		const indexID = 1002
		const response = await idaContract.getIndex(daix.address, irrigateAddress, indexID)
		if (response.exist != true) {
			await sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.createIndex(daix.address, indexID, "0x").encodeABI(), { from: irrigateAddress })
			console.log("Publishing index created, id: ", indexID)
		} else {
			console.log("Publishing index exists, id: ", indexID)
		}
		console.log("Irrigate initialization successful")
	},

	sfUpgradeDaix: async function(_amount) {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const daixWrapper = await sf.getERC20Wrapper(dai)
		const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
		await daix.upgrade(web3.utils.toWei(_amount, "ether"), { from: irrigateAddress })
		console.log("daix upgraded by ", _amount)
	},

	sfCreateIndex: async function(_indexNumber) {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const daixWrapper = await sf.getERC20Wrapper(dai)
		const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
		sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.createIndex(daix.address, _indexNumber, "0x").encodeABI(), { from: irrigateAddress })
		console.log("publishing index created, number: ", _indexNumber)
	}
}