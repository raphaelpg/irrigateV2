import React, { Component } from 'react'
import axios from 'axios'
import Zoom from 'react-reveal/Zoom'

class FormAddUser extends Component {
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

	submitUser = (event) => {
    event.preventDefault()
    const payload = new FormData()

    payload.append('email', this.state.email)
    payload.append('password', this.state.password)

    axios.post("/user/signup", payload)
      .then(() => {
        this.resetSignupInputs()
        this.props.closeFormAddUser()
        alert('Your account has been created')
      })
      .catch(() => {
        console.log('Internal server error')
      })
  }

  resetSignupInputs = () => {
    this.setState({
      email: '',
      password: '',
    })
  }

	render() {
		
    let FormAddUser = (
      <Zoom duration={300}>
        <div className="FormAddUser">
          <div className="FormAddUserTitle_Close">
            <p className="FormAddUserTitle">Sign up: </p>
            <button className="closeFormAddUserButton" onClick={this.props.closeFormAddUser}>x</button>
    			</div>
          <form onSubmit={this.submitUser} >
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
            <button className="FormAddCauseButton">Sign up</button>
          </form>
        </div>
      </Zoom>
		)

    if (! this.props.displayFormAddUser) {
      FormAddUser = null;
    }

    return (
      <div>
        {FormAddUser}
      </div>
    )
	}
}

export default FormAddUser;