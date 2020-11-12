const IrrigateMain = artifacts.require("IrrigateMain");

contract("IrrigateMain contract tests", async accounts => {
	it("should set the owner properly", async () => {
		let instance = await IrrigateMain.deployed();
		let deployer = accounts[0];
		console.log(accounts);
		let owner = await instance.owner.call();
		assert.equal(deployer, owner);
	});
});