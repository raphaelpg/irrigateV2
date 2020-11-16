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
		await sf.initialize();
		console.log("Superfluid initialized")
	},

	sfGetAddresses: async function() {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const daixWrapper = await sf.getERC20Wrapper(dai)
		// assert(daixWrapper.created)
		const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
		console.log("daiAddress: ", daiAddress)
		console.log("daixWrapper: ", daixWrapper)
	},

	sfMintDai: async function(_amount) {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		dai.mint(irrigateAddress, web3.utils.toWei(_amount, "ether"), { from: irrigateAddress })
		console.log(_amount, " dai minted")
	},

	sfGetDaiBalance: async function() {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const irrigateBalance = (wad4human(await dai.balanceOf(irrigateAddress)))
		console.log("irrigateBalance: ", irrigateBalance)
	},

	sfGetDaiX: async function() {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const daixWrapper = await sf.getERC20Wrapper(dai)
		const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
		console.log("daix address: ", daix.address)
	},

	sfApproveDaix: async function() {
		const daiAddress = await sf.resolver.get("tokens.fDAI")
		const dai = await sf.contracts.TestToken.at(daiAddress)
		const daixWrapper = await sf.getERC20Wrapper(dai)
		const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
		await dai.approve(daix.address, "1"+"0".repeat(42), { from: irrigateAddress })
		console.log("daix approved")
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