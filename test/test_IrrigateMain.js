const IrrigateMain = artifacts.require('IrrigateMain');

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract('IrrigateMain contract tests', async accounts => {
	const [owner, cause1, cause2, user1, user2] = accounts;

	//Before each unit test  
  beforeEach(async function() {
		this.instance = await IrrigateMain.new();
  });

	it('sets the contract owner properly', async function () {
		let calledOwner = await this.instance.owner.call();

		assert.equal(calledOwner, owner);
	});

	it('adds a cause address into the mapping and set it status to true', async function () {
		await this.instance.setCauseAddress(cause1, true);

		let status = await this.instance.causeAddressList.call(cause1);
		assert.equal(status, true);
	});

	it('sets the cause address status to false', async function () {
		await this.instance.setCauseAddress(cause1, false);

		let status = await this.instance.causeAddressList.call(cause1);
		assert.equal(status, false);
	});

	it('reverts setCauseAddress() when msg.sender is not the owner', async function () {
		await expectRevert(
      this.instance.setCauseAddress(cause1, false, { from: user1 }),
      'Ownable: caller is not the owner',
    );
	});

	it('emits a SetCauseAddress event on successful call', async function () {
		const receipt = await this.instance.setCauseAddress(cause1, true);

    expectEvent(receipt, 'SetCauseAddress', { causeAddress: cause1, message: 'Setting cause address successfull' });
  });
});