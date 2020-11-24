import React from 'react'
import Web3 from 'web3'
import { web3Modal, logoutOfWeb3Modal } from './utils/web3Modal'
import axios from 'axios'
import './css/App.scss'
import HomeDescription from './components/HomeDescription'
import FormAddCause from './components/FormAddCause'
import CausesList from './components/CausesList'
import Footer from './components/Footer'
import Subscription from './components/Subscription'
import OneTimeDonation from './components/OneTimeDonation'
const logo = require('./images/planet.png')
const { wad4human } = require('@decentral.ee/web3-helpers')
const SuperfluidSDK = require('@superfluid-finance/ethereum-contracts')

let dai;
let daix;
let sf;

class App extends React.Component {
  state = {
    causes: [],
    displayFormAddCause: false,
    userAuth: false,
    userToken: '',
    userStatus: '',
    displayFormAddUser: false,
    displayFormLogIn: false,
    displayStream: false,
    displaySubscription: false,
    displayOneTimeDonation: false,
    userCausesId: [],
    userCauses: [],
    currentStreamAmount: '0',
    newStreamAmount: '0',
    web3: null,
    network: '',
    provider: '',
    isFlow: '',
    flow: '0',
    accounts: null,
    accountsDaiBalance: '0',
    accountsDaixBalance: '0.00000',
    daiWarning: false,
    userDaixAllowance: null,
    irrigateAddress: '0xFC94FFAf800FcF5B146ceb4fc1C37dB604305ae5',
    mockDaiAddress: '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108',//using SF mock dai contract instead
    mockDaiContract: null,
    subscriptionIntervalID: '',
    cancelIntervalID: '',
  }

  componentDidMount = async () => {
    this.getIrrigateCauses()
    this.checkConnection()
  }

  /*Retrieve associations from the server*/
  getIrrigateCauses = async () => {
    try {
      axios.get('/api')
        .then((response) => {
          const data = response.data
          this.setState({ causes: data })
        })
        .catch(() => {
          console.log('Error retrieving causes list')
        })
    } catch (e) {
      console.log(e)
    }
  }

  /*Display subscription popup*/
  displaySubscription = async () => {
    this.setState({ displaySubscription:true })
  }

  /*Display one time donation popup*/
  displayOneTimeDonation = async () => {
    this.setState({ displayOneTimeDonation:true })
  }

  /*Check if wallet already connected at launch*/
  checkConnection = async () => {
    if (web3Modal.cachedProvider) {
      this.connectWallet();
    }
  };

  /*Connect wallet and initialize Superfluid and state variables*/
  connectWallet = async () => {
    if (this.state.provider) {
      logoutOfWeb3Modal()
    } else {
      try {
        const provider = await web3Modal.connect();
        const web3 = new Web3(provider);

        sf = new SuperfluidSDK.Framework({
            version: "0.1.2-preview-20201014", // This is for using different protocol release
            web3Provider: web3.currentProvider // your web3 provider
        });

        await sf.initialize()

        const daiAddress = await sf.resolver.get("tokens.fDAI");
        dai = await sf.contracts.TestToken.at(daiAddress);
        const daixWrapper = await sf.getERC20Wrapper(dai);
        daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress);

        global.web3 = sf.web3;

        const accounts = await sf.web3.eth.getAccounts();

        await web3.eth.net.getNetworkType((err, network) => {
          this.setState({network: network})
        })

        const flow = (await sf.agreements.cfa.getNetFlow.call(daix.address, accounts[0])).toString()
        const accountsDaiBalance = (wad4human(await dai.balanceOf.call(accounts[0])))
        const accountsDaixBalance = (wad4human(await daix.balanceOf.call(accounts[0])))
        // const userDaixAllowance = (wad4human(await dai.allowance.call(accounts[0], daix.address)))
        this.setState({
          web3,
          accounts,
          mockDaiContract: dai,
          provider,
          flow,
          accountsDaiBalance,
          accountsDaixBalance,
        })
      } catch (error) {
        alert(`No wallet detected or wrong network.\nAdd a crypto wallet such as Metamask to your browser and switch it to Goerli network.`);
      }
    }
  }

  /*Mint 100 DAI from sf mock dai*/
  mintDAI = async() => {
    const mockDaiContract = this.state.mockDaiContract
    const userAddress = this.state.accounts[0]
    //mint some dai here!  100 default amount
    await dai.mint(
      userAddress,
      sf.web3.utils.toWei("100", "ether"),
      { from: userAddress }
    );
    this.setState({
      accountsDaiBalance: (wad4human(await mockDaiContract.balanceOf.call(userAddress))),
    })
  }

  /*Approve max mock dai*/
  approveDAI = async() => {
    const userAddress = this.state.accounts[0]
    await dai
      .approve(
        daix.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        { from: userAddress }
      )
  }

  /*SF upgrade function*/
  upgradeDAIx = async() => {
    const userAddress = this.state.accounts[0]
    await daix
      .upgrade(
        sf.web3.utils.toWei("10", "ether"),
        { from: userAddress }
      )
  }

  /*Create SF Constant Flow Agreement*/
  createCFA = async(_amount) => {
    const userAddress = this.state.accounts[0]
    const recipient = this.state.irrigateAddress
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .createFlow(daix.address, recipient, _amount, "0x")
        .encodeABI(),
      { from: userAddress })
  }

  /*Stop SF Constant Flow Agreement*/
  stopCFA = async() => {
    const userAddress = this.state.accounts[0]
    const recipient = this.state.irrigateAddress
    try{
      await sf.host.callAgreement(
        sf.agreements.cfa.address,
        sf.agreements.cfa.contract.methods
          .deleteFlow(daix.address, userAddress, recipient, "0x")
          .encodeABI(),
        { from: userAddress })
      .then(
        this.setState({ displaySubscription:false }),
        this.cancelInterval()
      )
    } catch(err) {
      console.log(err)
    }
  }

  /*SF get user net flow*/
  getNetFlow = async() => {
    const userAddress = this.state.accounts[0]
    this.setState({
      flow: (await sf.agreements.cfa.getNetFlow.call(daix.address, userAddress)).toString()
    })
  }

  /*Timer after subscribing action, will be replace by event susbcription or drizzle*/
  subscriptionInterval() {
    let subscriptionIntervalID = setInterval(() => {
      if (this.state.flow !== '0') {
        //success
        //create success confirmation pop up
        clearInterval(this.state.subscriptionIntervalID)
      } else {
        this.getNetFlow()
      }
    }, 10000)
    this.setState({subscriptionIntervalID: subscriptionIntervalID})
  }

  /*Timer after canceling subscription action, will be replace by event susbcription or drizzle*/
  cancelInterval() {
    let cancelIntervalID = setInterval(() => {
      if (this.state.flow === '0') {
        //success
        //create cancel confirmation pop up
        clearInterval(this.state.cancelIntervalID)
      } else {
        this.getNetFlow()
      }
    }, 10000)
    this.setState({cancelIntervalID: cancelIntervalID})
  }

  /*Call SF create Constant Flow Agreement*/
  batchCall = async(_amount) => {
    if(_amount !== 0 && this.state.accounts !== null && this.state.accountsDaixBalance !== '0.00000') {
      // const userAddress = this.state.accounts[0]
      // const recipient = this.state.irrigateAddress
      // const amount = _amount.toString()
      const amountPerSecond = (Math.floor((_amount)*(10**18)/(3600*24*30))).toString()
      // let batch = new sf.web3.BatchRequest()
      // batch.add(dai.approve(daix.address,"115792089237316195423570985008687907853269984665640564039457584007913129639935",{ from: userAddress }))
      // batch.add(daix.upgrade(sf.web3.utils.toWei(amount, "ether"),{ from: userAddress }))
      // batch.add(sf.host.callAgreement(sf.agreements.cfa.address,sf.agreements.cfa.contract.methods.createFlow(daix.address, recipient, amountPerSecond, "0x").encodeABI(),{ from: userAddress }))
      try {
        // await batch.execute()
        await this.createCFA(amountPerSecond)
        .then(
          this.setState({ displaySubscription:false }),
          this.subscriptionInterval()
        )
      } catch(err) {
        console.log(err)
      }
    }
  }

  /*Simple mock DAI transfer*/
  oneTransfer = async(_amount) => {
    if(_amount >= 10) {
      const userAddress = this.state.accounts[0]
      const appAddress = this.state.irrigateAddress
      const daiBalance = this.state.accountsDaiBalance
      const amount = _amount.toString()
      if (daiBalance >= _amount) {
        this.setState({
          daiWarning: false
        })
        await dai.transfer(
          appAddress,
          sf.web3.utils.toWei(amount, "ether"),
          { from: userAddress }
        )
      } else {
        this.setState({
          daiWarning: true
        })
      }
    }
  }

  render() {
    // console.log("flow:",this.state.flow)

    /*Display if user have a subscription active*/
    let FormUserConnected = (
      <div>
        <button className="displayFormAddUserButton description" onClick={ this.displaySubscription }>Manage your Subscription</button>
      </div>
    )
    if (this.state.accounts === null || this.state.flow === '0') {
      FormUserConnected = null
    }

    return(
      <div className="app">
        <div className="Navbar">
          <div className="NavbarLeftCorner">
            <img className="NavbarLogo" src={logo} alt="Irrigate logo"></img>
            <h1 className="Title">IRRIGATE</h1>
          </div>
          <div className="NavbarRightCorner">
            {FormUserConnected}
            <button className="connectWalletButton" onClick={ this.connectWallet }>{this.state.accounts === null ? ("Connect wallet") : ("Disconnect wallet \n" + (this.state.accounts[0].slice(0, 10) + "...")) }</button>
            <Subscription
              displaySubscription={ this.state.displaySubscription } 
              closeSubscription={ (e) => this.setState({ displaySubscription:false }) }
              currentStreamAmount={ this.state.currentStreamAmount }
              getUserData={ this.getUserData }
              irrigateAddress={ this.state.irrigateAddress }
              accounts={ this.state.accounts }
              mockDaiContract={ this.state.mockDaiContract }
              userCausesId={ this.state.userCausesId }
              mintDAI={ this.mintDAI }
              batchCall={ this.batchCall }
              stopCFA={ this.stopCFA }
              flow={ this.state.flow }
              accountsDaiBalance={ this.state.accountsDaiBalance }
              accountsDaixBalance={ this.state.accountsDaixBalance }
            />
          </div>
        </div> 
        <div className="HomeDescription_FormAddCause">
          <HomeDescription
            displayFormAddCause={(e) => this.setState({ displayFormAddCause:true})}
            displaySubscription={ this.displaySubscription }
            displayOneTimeDonation={ this.displayOneTimeDonation } 
          />
          <FormAddCause 
            getIrrigateCauses={ this.getIrrigateCauses }
            displayFormAddCause={ this.state.displayFormAddCause } 
            closeFormAddCause={(e) => this.setState({ displayFormAddCause:false })}
          />
          <OneTimeDonation
            displayOneTimeDonation={ this.state.displayOneTimeDonation } 
            closeOneTimeDonation={ (e) => this.setState({ displayOneTimeDonation:false }) }
            oneTransfer={ this.oneTransfer }
            irrigateAddress={ this.state.irrigateAddress }
            accounts={ this.state.accounts }
            accountsDaiBalance={ this.state.accountsDaiBalance }
            daiWarning={ this.state.daiWarning }
          />
        </div>
        <CausesList
          causes={ this.state.causes }
          addCauseToUserList={this.addCauseToUserList}
        />
        <Footer />
      </div>
    )
  }
}

export default App