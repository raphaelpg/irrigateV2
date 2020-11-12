import React, { Component } from 'react'
import axios from 'axios'
import Zoom from 'react-reveal/Zoom'

class FormLogIn extends Component {
	constructor(props){
		super(props);
		this.state = {
			email: '',
			password: ''
		};
	}

	handleChange = ({ target }) => {
    const { name, value } = target
    this.setState({ [name]: value })
  }

	logUser = async (event) => {
    event.preventDefault()
    const payload = new FormData()

    payload.append('email', this.state.email)
    payload.append('password', this.state.password)

    await axios.post("/user/login", payload)
      .then((res) => {
        sessionStorage.setItem('userEmail', this.state.email)
        sessionStorage.setItem('userAuth', 'true');
        sessionStorage.setItem('userToken', res.data.token);
        this.resetSignupInputs()
      })
      .catch((error) => {
        console.log(error)
      }
    )
    this.props.closeFormLogIn()
  }

  resetSignupInputs = () => {
    this.setState({
      email: '',
      password: '',
    })
  }

	render() {
		
    let FormLogIn = (
      <Zoom duration={300}>
        <div className="FormAddUser">
          <div className="FormAddUserTitle_Close">
            <p className="FormAddUserTitle">Login: </p>
            <button className="closeFormAddUserButton" onClick={this.props.closeFormLogIn}>x</button>
    			</div>
          <form onSubmit={this.logUser} >
            <label>Email</label>
            <div className="form-input">
              <input 
                name="email" 
                type="text" 
                value={this.state.email} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Password</label>
            <div className="form-input">
              <input 
                name="password" 
                type="password" 
                value={this.state.password} 
                onChange={this.handleChange} 
              />
            </div>
            <button className="FormAddCauseButton">Login</button>
          </form>
        </div>
		  </Zoom>
    )

    if (! this.props.displayFormLogIn) {
      FormLogIn = null;
    }

    return (
      <div>
        {FormLogIn}
      </div>
    )
	}
}

export default FormLogIn;