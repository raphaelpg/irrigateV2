import React, { Component } from 'react';
import Zoom from 'react-reveal/Zoom'
import axios from 'axios';
import getWeb3 from '../utils/getWeb3';

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

  displayUserCauses = (userCauses) => {
    if (!userCauses) return null
    return userCauses.map( (cause, index) => (
      <div className="causeDisplay" key={index}>
        <button className="closeUserCauseButton" name={cause._id} onClick={this.props.removeCauseFromUserList}>x</button>
        <div className="causeLogoContainer">
          <img className="causeLogo" src={cause.logoName} alt={cause.name} />
        </div>
        <h3>{cause.name}</h3>
        <p>{cause.category}</p>
      </div>
    ))
  }

  setStreamAmount = (event) => {
    event.preventDefault()
    const payload = new FormData()
    const userEmail = sessionStorage.getItem('userEmail')
    const userToken = sessionStorage.getItem('userToken')
    payload.append('email', userEmail)
    payload.append('newStreamAmount', this.state.newStreamAmount)

    let config = {
      headers: {
        Authorization: 'Bearer ' + userToken
      }
    }

    axios.post("/user/updateStreamAmount", payload, config)
      .then(() => {
        console.log('New stream amount sent to the server')
        this.props.getUserData()
      })
      .catch(() => {
        console.log('Internal server error')
      })
  }

  donateOnce = async (event) => {
    event.preventDefault()
    if (this.props.userCausesId.length < 1) {
      alert("Add a cause to your list first")
      return
    } else {
      const web3 = await getWeb3();
      const { userCausesId, irrigateAddress, accounts, mockDaiContract } = this.props
      const getBalance = await mockDaiContract.methods.balanceOf(accounts[0]).call()
      const userBalance = parseInt(getBalance)
      const userDonation = web3.utils.toWei(this.state.donateOnceAmount, "ether").toString()
      if (userBalance >= userDonation) {
        await mockDaiContract.methods.transfer(irrigateAddress, userDonation).send({from: accounts[0]})
        .then(() => {
          const payload = new FormData()
          payload.append('amount', userDonation)
          payload.append('causeAddress', userCausesId[0])
          
          axios.post("/donations/donateOnce", payload)
            .then(() => {
              alert('Success ! Donation sent !')
            })
            .catch(() => {
              console.log('Internal server error')
            })
        })
        .catch(() => {
          console.log("Transfer failed")
        })
      } else alert("Unsufficient DAI balance")
    }
  }

	render() {
    // console.log(this.state)
    let CancelSubscription = (
      <div>
        <button className="FormAddCauseButton" onClick={ this.props.stopCFA }>Cancel subscription</button>
      </div>
    )

    if (this.props.flow === '0') {
      CancelSubscription = null
    }

    let Subscription = (
      <Zoom duration={300}>
        <div className="Stream"> 
          <div className="StreamTitle_Close">
            <p className="StreamTitle">Support causes around the world:</p>
            <button className="closeFormAddCauseButton" onClick={this.props.closeSubscription}>x</button>
          </div>
          {/*<div>Your supported causes:</div>*/}
          <div className="userCausesContainer">
            {this.displayUserCauses(this.props.userCauses)}
          </div>

          {/*<button className="streamButton" onClick={ this.props.mintDAI }>Mint DAI</button>*/}
          <div className="subscriptionAmountContainer">
            <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="10" >10 DAI</button>
            <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="20" >20 DAI</button>
            <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="50" >50 DAI</button>
            <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="100" >100 DAI</button>
            <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="200" >200 DAI</button>
            <button className="subscriptionAmountButton" name="subscriptionAmount" onClick={ this.handleChange } value="500" >500 DAI</button>
          </div>
          <button className="FormAddCauseButton" onClick={ () => this.props.batchCall(this.state.subscriptionAmount)}>Give {this.state.subscriptionAmount} DAI monthly</button>
          {/*<button className="FormAddCauseButton" onClick={ this.props.stopCFA }>Cancel subscription</button>*/}
          {CancelSubscription}
          <button className="FormAddCauseButton" onClick={ this.props.mintDAI }>Mint some Goerli DAI</button>

 {/*         <div className="donateOnceContainer">
            <form className="donateOnceForm" onSubmit={this.donateOnce} >
              <label>Donation value: </label>
              <div className="form-input">
                <input 
                  name="donateOnceAmount" 
                  type="number" 
                  min="5"
                  step="5"
                  placeholder="0"
                  onChange={this.handleChange} 
                /> DAI
              </div>
              <button className="FormAddCauseButton">Donate once</button>
            </form>
          </div>*/}

          {/*<div>
            <p className="">Your current stream: {this.props.currentStreamAmount} DAI / month</p>
            <form className="setStreamForm" onSubmit={this.setStreamAmount} >
              <label>Set monthly donation to: </label>
              <div className="form-input">
                <input 
                  name="newStreamAmount" 
                  type="number" 
                  min="0"
                  step="5"
                  placeholder="5"
                  onChange={this.handleChange} 
                /> DAI
              </div>
              <button className="FormAddCauseButton">Set amount</button>
            </form>
          </div>*/}
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