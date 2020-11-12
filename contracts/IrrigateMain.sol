pragma solidity ^0.7.4;

contract IrrigateMain {
	address owner;
	
	constructor() public {
		owner = msg.sender;
	}

	function registerCauseAddress(address _causeAddress) public {};
	function modifyCauseAddress(address _causeAddress) public {};
	function deleteCauseAddress(address _causeAddress) public {};
	function distributeDonations() public {};
	function sendDonorPOD(address _donor) public {};
}