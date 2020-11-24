import React, { Component } from 'react'
import Zoom from 'react-reveal/Zoom'
import sfLogo from '../images/superfluid_logo.svg'

class Subscription extends Component {
	constructor(props){
		super(props);
		this.state = {
      newStreamAmount: '',
      donateOnceAmount: '5',
      subscriptionAmount: 0
		};
	}

  handleChange = ({ target }) => {
    const { name, value } = target
    this.setState({ [name]: Number(value) })
  }

	render() {
    let SuperfluidWarning = (
      <div>
        <div className="SuperfluidWarning">You must have DAI deposited in your Superfluid account to subscribe monthly</div>
        <div className="SuperfluidWarning">Mint some DAI here and make a deposit at Superfluid</div>
        <div className="SubscriptionButtonContainer">
          {/*<a className="FormMintDaiButton" href="https://goerli-faucet.slock.it/" target="_blank">Get Goerli ETH</a>*/}
          <button className="FormMintDaiButton" onClick={() => window.open("https://goerli-faucet.slock.it/", "_blank") }>Get Goerli ETH</button>
          <button className="FormMintDaiButton" onClick={ this.props.mintDAI } >Mint DAI</button>
          <a className="SFbutton" href="https://app.superfluid.finance/" target="_blank" rel="noopener noreferrer"><img src={sfLogo} alt="Superfluid protocol"/></a>
        </div>
      </div>
    )
    if (this.props.accountsDaixBalance !== '0.00000' || this.props.accounts === null) {
      SuperfluidWarning = null
    }

    let WarningPhrase = (
      <div className="WarningPhrase">Please connect your wallet first</div>
    )
    if (this.props.accounts !== null) {
      WarningPhrase = null
    }

    let SetSubscription = (
      <div> 
        <div className="StreamTitle_Close">
          <p className="StreamTitle">Support causes around the world:</p>
          <button className="closeFormAddCauseButton" onClick={this.props.closeSubscription}>x</button>
        </div>
        <div className="SubscriptionDetailsTop">Each month, your donations will be redistributed to associations registered on the platform</div>
        <div className="subscriptionAmountContainer">
          <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="10" >10 DAI</button>
          <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="20" >20 DAI</button>
          <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="50" >50 DAI</button>
          <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="100" >100 DAI</button>
          <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="200" >200 DAI</button>
          <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="500" >500 DAI</button>
        </div>
        <button className={this.state.subscriptionAmount === 0 || this.props.accounts === null || this.props.accountsDaixBalance === '0.00000' ? ("FormAddCauseButtonDisabled") : ("FormAddCauseButton") } 
          onClick={ () => this.props.batchCall(this.state.subscriptionAmount)}>
          Give {this.state.subscriptionAmount} DAI monthly
        </button>
        {WarningPhrase}
        {SuperfluidWarning}
      </div>
    )

    let CancelSubscription = (
      <div> 
        <div className="StreamTitle_Close">
          <p className="StreamTitle">Manage you donation:</p>
          <p className="CurrentDonation">Your are currently donating { Math.round(-(this.props.flow)*3600*24*30/10**18) } DAI per month to the platform</p>
        <div className="SubscriptionDetails">These funds are redistributed each month to assiociations registered on the platform</div>
          <button className="closeFormAddCauseButton" onClick={this.props.closeSubscription}>x</button>
        </div>
        <button className="FormAddCauseButton" onClick={ this.props.stopCFA }>Cancel subscription</button>
        <div className="SubscriptionDetails">To modify your subscription amount you need to cancel the current subscription and create a new one</div>
      </div>
    )

    if (this.props.flow === '0') {
      CancelSubscription = null
    } else {
      SetSubscription = null
    }

    let Subscription = (
      <Zoom duration={300}>
        <div className="Stream">
          {SetSubscription}
          {CancelSubscription}
        </div>
      </Zoom>
		)

    if (! this.props.displaySubscription) {
      Subscription = null;
    }

    return (
      <div>
        {Subscription}
      </div>
    )
	}
}

export default Subscription;