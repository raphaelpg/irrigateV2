import React from 'react'
// import getWeb3 from './utils/getWeb3'
import Web3 from 'web3'
import Web3Modal from "web3modal"
import { logoutOfWeb3Modal } from './utils/web3Modal'
import axios from 'axios'
import './css/App.scss'
import MockDAI from './contracts/MockDAI.json'
import HomeDescription from './components/HomeDescription'
import FormAddCause from './components/FormAddCause'
import CausesList from './components/CausesList'
import Footer from './components/Footer'
import FormAddUser from './components/FormAddUser'
import FormLogIn from './components/FormLogIn'
import Stream from './components/Stream'
import Subscription from './components/Subscription'
import Logout from './components/Logout'
const logo = require('./components/planet.png')
const { wad4human } = require('@decentral.ee/web3-helpers')
const SuperfluidSDK = require('@superfluid-finance/ethereum-contracts')
const TruffleContract = require('@truffle/contract')

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
    userCausesId: [],
    userCauses: [],
    currentStreamAmount: '0',
    newStreamAmount: '0',
    web3: null,
    network: '',
    provider: '',
    accounts: null,
    accountsDaiBalance: '0',
    irrigateAddress: '0xFC94FFAf800FcF5B146ceb4fc1C37dB604305ae5',
    mockDaiAddress: '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108',
    mockDaiContract: null,
  }

  componentDidMount = async () => {
    this.getIrrigateCauses()
    this.checkSessionStorage()
  }

  async getIrrigateCauses() {
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

  checkSessionStorage = async () => {
    try {
      const sessionUserAuth = await sessionStorage.getItem('userAuth')
      const sessionUserToken = await sessionStorage.getItem('userToken')
      this.setState({ userAuth: sessionUserAuth, userToken: sessionUserToken })
      if (sessionUserAuth === 'true') {
        this.setState({ userStatus: 'Connected' })
        this.getUserData()
      } else {
        this.setState({ userStatus: '' })
      }
    } catch (e) {
      console.log(e)
    }
  }

  async saveUserCauses() {
    try {
      if (sessionStorage.getItem('userAuth') === 'true') {
        const userEmail = sessionStorage.getItem('userEmail')
        const userToken = sessionStorage.getItem('userToken')

        const payload = new FormData()
        payload.append('email', userEmail)
        payload.append('userCausesId', this.state.userCausesId)
        let config = {
          headers: {
            Authorization: 'Bearer ' + userToken
          }
        }

        axios.post('/user/saveCauses', payload, config)
          .catch(() => {
            console.log('Error sending user causes list')
          })
      }
    } catch (e) {
      console.log(e)
    }
  }

  async getUserData() {
    try {
      if (sessionStorage.getItem('userAuth') === 'true') {
        const userEmail = sessionStorage.getItem('userEmail')
        const userToken = sessionStorage.getItem('userToken')

        const payload = new FormData()
        payload.append('email', userEmail)

        let config = {
          headers: {
            Authorization: 'Bearer ' + userToken
          }
        }

        axios.post('/user/data', payload, config)
          .then((response) => {
            const data = response.data
            this.setState({
              currentStreamAmount: data[0].streamAmount,
              userCausesId: data[0].subscribedCauses
            })
            if (data[0].subscribedCauses.length > 0) {
              this.getUserCauses()
            }
          })
          .catch(() => {
            console.log('Error retrieving user causes list')
          })
      }
    } catch (e) {
      console.log(e)
    }
  }

  addCauseToUserList = ({ target }) => {
    this.state.userCausesId.push(target.name)
    this.saveUserCauses()
    this.getUserCauses()
  }

  removeCauseFromUserList = ({ target }) => {
    const causeIndex = this.state.userCausesId.indexOf(target.name);
    if (causeIndex > -1) {
      this.state.userCausesId.splice(causeIndex, 1);
    }
    this.saveUserCauses()
    this.getUserCauses()
  }

  async getUserCauses() {
    try {
      const payload = new FormData()
      const userToken = sessionStorage.getItem('userToken')
      if (this.state.userCausesId.length < 1) {
        payload.append('causesId', 'none')
      } else {
        payload.append('causesId', this.state.userCausesId)
      }
      payload.append('userEmail', sessionStorage.getItem('userEmail'))

      let config = {
        headers: {
          Authorization: 'Bearer ' + userToken
        }
      }

      axios.post('/user/causes', payload, config)
        .then((response) => {
          const data = response.data
          this.setState({ userCauses: data })
        })
        .catch((e) => {
          console.log(e)
        })
    } catch (e) {
      console.log(e)
    }
  }

  displayStreamAndConnectWallet = async () => {
    this.setState({ displayStream:true })
  }

  displaySubscription = async () => {
    this.setState({ displaySubscription:true })
  }

  connectWallet = async () => {
    if (this.state.provider) {
      logoutOfWeb3Modal()
    } else {
      try {
        /*const providerOptions = {
           //See Provider Options Section 
        };*/

        const web3Modal = new Web3Modal({
          network: "goerli", // optional
          cacheProvider: true // optional
          // providerOptions // required
        });

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
        // const accounts = await web3.eth.getAccounts()
        /*const instanceDAI = new web3.eth.Contract(
          MockDAI,
          this.state.mockDaiAddress,
        )*/

        this.setState({
          web3,
          accounts,
          mockDaiContract: dai,
          provider,
        })
      } catch (error) {
        alert(`No wallet detected or wrong network.\nAdd a crypto wallet such as Metamask to your browser and switch it to Goerli network.`);
      } 
    }
  }

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

  approveDAI = async() => {
    const userAddress = this.state.accounts[0]
    await dai
      .approve(
        daix.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        { from: userAddress }
      )
/*      .then(async i =>
        setDAIapproved(
          wad4human(await dai.allowance.call(userAddress, daix.address))
        )
      );*/
  }

  upgradeDAIx = async() => {
    const userAddress = this.state.accounts[0]
    await daix
      .upgrade(
        sf.web3.utils.toWei("10", "ether"),
        { from: userAddress }
      )
  }

  createCFA = async() => {
    const userAddress = this.state.accounts[0]
    const recipient = this.state.irrigateAddress
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .createFlow(daix.address, recipient, "385802469135802", "0x")//10 per month
        .encodeABI(),
      { from: userAddress })
  }

  stopCFA = async() => {
    const userAddress = this.state.accounts[0]
    const recipient = this.state.irrigateAddress
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .deleteFlow(daix.address, userAddress, recipient, "0x")
        .encodeABI(),
      { from: userAddress })
  }

  batchCall = async(_amount) => {
    if(_amount !== 0) {
      const userAddress = this.state.accounts[0]
      const recipient = this.state.irrigateAddress
      const amount = _amount.toString()
      const amountPerSecond = (Math.floor((_amount)*(10**18)/(3600*24*30))).toString()
      let batch = new sf.web3.BatchRequest()
      const userAllowance = wad4human(await dai.allowance.call(userAddress, daix.address))
      // if (userAllowance === 0) {
      //   batch.add(dai.approve(daix.address,"115792089237316195423570985008687907853269984665640564039457584007913129639935",{ from: userAddress }))
      // }
      // batch.add(daix.upgrade(sf.web3.utils.toWei(amount, "ether"),{ from: userAddress }))
      batch.add(sf.host.callAgreement(sf.agreements.cfa.address,sf.agreements.cfa.contract.methods.createFlow(daix.address, recipient, amountPerSecond, "0x").encodeABI(),{ from: userAddress }))
      try {
        batch.execute()
      } catch(err) {
        console.log(err)
      }
    }
  }

  render() {
    // console.log(this.state.accounts)
    let FormAddUserButton = (
      <div className="NavbarRightCorner">
        <button className="displayFormAddUserButton description" onClick={(e) => this.setState({ displayFormAddUser:true })}>Sign up</button>
        <button className="displayFormLoginUserButton description" onClick={(e) => this.setState({ displayFormLogIn:true })}>Log in</button>
      </div>
    )

    let FormUserConnected = (
      <div className="NavbarRightCorner">
        {/*<button className="displayFormAddUserButton description" onClick={ this.displayStreamAndConnectWallet }>Manage your stream</button>*/}
        <button className="displayFormAddUserButton description" onClick={ this.displaySubscription }>Manage your subscription</button>
        <Logout checkSessionStorage={ this.checkSessionStorage } />
      </div>
    )

    if (this.state.userStatus === 'Connected') {
      FormAddUserButton = null
    } else {
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
            <button className="connectWalletButton" onClick={ this.connectWallet }>{this.state.accounts === null ? ("Connect wallet") : ("Disconnect wallet \n" + (this.state.accounts[0].slice(0, 10) + "...")) }</button>
            {/*<button className="connectWalletButton" onClick={ this.mintDAI }>Mint DAI</button>*/}
            {/*<button className="connectWalletButton" onClick={ this.approveDAI }>Approve DAI</button>*/}
            {/*<button className="connectWalletButton" onClick={ this.upgradeDAIx }>Upgrade DAIx</button>*/}
            {/*<button className="connectWalletButton" onClick={ this.createCFA }>Create CFA</button>*/}
            {/*<button className="connectWalletButton" onClick={ () => this.batchCall(10) }>Batch</button>*/}
            {/*<button className="connectWalletButton" onClick={ this.stopCFA }>Stop CFA</button>*/}
            {FormAddUserButton}
            {FormUserConnected}
            <FormAddUser 
              displayFormAddUser={ this.state.displayFormAddUser } 
              closeFormAddUser={(e) => this.setState({ displayFormAddUser:false })}
            />
            <FormLogIn 
              displayFormLogIn={ this.state.displayFormLogIn } 
              closeFormLogIn={(e) => {
                this.setState({ displayFormLogIn:false })
                this.checkSessionStorage()
              }}
            />
            {/*<Stream
              displayStream={ this.state.displayStream } 
              closeStream={ (e) => this.setState({ displayStream:false }) }
              userCauses={ this.state.userCauses }
              currentStreamAmount={ this.state.currentStreamAmount }
              getUserData={ this.getUserData }
              irrigateAddress={ this.state.irrigateAddress }
              accounts={ this.state.accounts }
              mockDaiContract={ this.state.mockDaiContract }
              userCausesId={ this.state.userCausesId }
              removeCauseFromUserList={ this.removeCauseFromUserList }
              mintDAI={ this.mintDAI }
              batchCall={ this.batchCall }
              stopCFA={ this.stopCFA }
            />*/}
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
            />
          </div>
        </div> 
        <div className="HomeDescription_FormAddCause">
          <HomeDescription />
          <button className="displayFormAddCauseButton" onClick={(e) => this.setState({ displayFormAddCause:true })}>Register your cause</button>
          <FormAddCause 
            getIrrigateCauses={ this.getIrrigateCauses }
            displayFormAddCause={ this.state.displayFormAddCause } 
            closeFormAddCause={(e) => this.setState({ displayFormAddCause:false })}
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