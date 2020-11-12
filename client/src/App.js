import React from 'react'
import getWeb3 from './utils/getWeb3'
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
import Logout from './components/Logout'
const logo = require('./components/planet.png')

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
    userCausesId: [],
    userCauses: [],
    currentStreamAmount: '0',
    newStreamAmount: '0',
    web3: null,
    network: '',
    accounts: null,
    irrigateAddress: '0xC1f1B00Ca70bB54a4d2BC95d07f2647889E2331a',
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
    try {
      const web3 = await getWeb3();

      await web3.eth.net.getNetworkType((err, network) => {
        this.setState({network: network})
      })
      const accounts = await web3.eth.getAccounts()
      const instanceDAI = new web3.eth.Contract(
        MockDAI,
        this.state.mockDaiAddress,
      )

      this.setState({
        web3,
        accounts,
        mockDaiContract: instanceDAI,
      })
    } catch (error) {
      alert(`No wallet detected or wrong network.\nAdd a crypto wallet such as Metamask to your browser and switch it to Ropsten network.`);
    } 
  }

  render() {

    let FormAddUserButton = (
      <div className="NavbarRightCorner">
        <button className="displayFormAddUserButton description" onClick={(e) => this.setState({ displayFormAddUser:true })}>Sign up</button>
        <button className="displayFormLoginUserButton description" onClick={(e) => this.setState({ displayFormLogIn:true })}>Log in</button>
      </div>
    )

    let FormUserConnected = (
      <div className="NavbarRightCorner">
        <button className="displayFormAddUserButton description" onClick={ this.displayStreamAndConnectWallet }>Manage your stream</button>
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
            <Stream
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