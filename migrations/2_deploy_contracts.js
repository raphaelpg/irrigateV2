const IrrigateMain = artifacts.require("IrrigateMain");

module.exports = function(deployer) {
  deployer.deploy(IrrigateMain);
};