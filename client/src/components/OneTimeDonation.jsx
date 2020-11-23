import React, { Component } from 'react';
import Zoom from 'react-reveal/Zoom'

class OneTimeDonation extends Component {
	constructor(props){
		super(props);
		this.state = {
      donationAmount: 0
		};
	}

  handleChange = ({ target }) => {
    const { name, value } = target
    this.setState({ [name]: Number(value) })
  }

	render() {
    let WarningPhrase = (
      <div className="WarningPhrase">Please connect your wallet first</div>
    )
    if (this.props.accounts !== null) {
      WarningPhrase = null
    }

    let BalanceWarning = (
      <div className="WarningPhrase">Insuficient DAI in your balance</div>
    )
    if (this.props.daiWarning === false) {
      BalanceWarning = null
    }

    let SetDonationAmount = (
      <div> 
        <div className="StreamTitle_Close">
          <p className="StreamTitle">Support causes around the world:</p>
          <button className="closeFormAddCauseButton" onClick={this.props.closeOneTimeDonation}>x</button>
        </div>
        <div className="SubscriptionDetailsTop">We accepts donations in DAI</div>
        <div className="SubscriptionDetailsTop">Our address is: {this.props.irrigateAddress}</div>
        <div className="SubscriptionDetailsTop">Donations will be distributed to associations registered on the platform</div>
        <div className="SubscriptionDetailsTop"></div>
        <div className="subscriptionAmountContainer">
          <button className="subscriptionAmountButton" name="donationAmount" onClick={ this.handleChange } value="10" >10 DAI</button>
          <button className="subscriptionAmountButton" name="donationAmount" onClick={ this.handleChange } value="20" >20 DAI</button>
          <button className="subscriptionAmountButton" name="donationAmount" onClick={ this.handleChange } value="50" >50 DAI</button>
          <button className="subscriptionAmountButton" name="donationAmount" onClick={ this.handleChange } value="100" >100 DAI</button>
          <button className="subscriptionAmountButton" name="donationAmount" onClick={ this.handleChange } value="200" >200 DAI</button>
          <button className="subscriptionAmountButton" name="donationAmount" onClick={ this.handleChange } value="500" >500 DAI</button>
        </div>
        <button className={this.state.donationAmount === 0 || this.props.accounts === null ? ("FormAddCauseButtonDisabled") : ("FormAddCauseButton") } onClick={ () => this.props.oneTransfer(this.state.donationAmount)}>Send {this.state.donationAmount} DAI</button>
        {WarningPhrase}
        {BalanceWarning}
        <div className="SubscriptionDetailsTop">You can also send donations directly to associations using the address provided on their description</div>
      </div>
    )

    let OneTimeDonation = (
      <Zoom duration={300}>
        <div className="Stream">
          {SetDonationAmount}
        </div>
      </Zoom>
		)

    if (! this.props.displayOneTimeDonation) {
      OneTimeDonation = null;
    }

    return (
      <div>
        {OneTimeDonation}
      </div>
    )
	}
}

export default OneTimeDonation;