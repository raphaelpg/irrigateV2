// Open Zeppelin Context contrat
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/GSN/Context.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

// Open Zeppelin Ownable contrat
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// Irrigate main contract
pragma solidity ^0.6.0;

contract IrrigateMain is Ownable {
	mapping(address => bool) public causeAddressList;
	mapping(address => uint) public genericDonations;
	mapping(address => uint) public specificDonations;

  event SetCauseAddress(address indexed causeAddress, string message);
  event GenericDonationSaved(address indexed donorAddress, uint amount, string message);
  event SpecificDonationSaved(address indexed receiver, uint amount, string message);
  event DonationsDistributed(string message);
  event PODSentToDonor(address indexed donorAddress, string message);

	constructor() public {
	}

	receive () external payable {}

	function setCauseAddress(address _causeAddress, bool _status) public onlyOwner {
		require(_causeAddress != address(0), "Not valid address");

		causeAddressList[_causeAddress] = _status;
    emit SetCauseAddress(_causeAddress, "Setting cause address successfull");
	}

	function saveGenericDonation(address _donorAddress, uint _amount) public onlyOwner {
		require(_donor != address(0), "Not valid address");
	
		genericDonations[_donor] = _amount;
		emit GenericDonationSaved(_donorAddress, _amount, "Generic donation saved");
	}

	function saveSpecificDonation(address _donorAddress, address _receiver, uint _amount) public onlyOwner {
		require(_donorAddress != address(0), "Not valid donor address");
		require(_receiver != address(0), "Not valid receiver address");
		require(causeAddressList[_receiver] == true, "Not active receiver address");

		uint newBalance = specificDonations[receiver] + _amount;
		specificDonations[receiver] = newBalance;
		emit SpecificDonationSaved(_receiver, _amount, "Specific donation saved");  
	}

	function distributeDonations() public onlyOwner {
    emit DonationsDistributed("Donations distribution successfull");
	}

	function sendDonorPOD(address _donorAddress) public onlyOwner {
    emit PODSentToDonor(_donorAddress, "POD sent");
	}
}