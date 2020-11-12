import React, { Component } from 'react';

class Logout extends Component {
	constructor(props){
		super(props);
		this.state = {

		};
	}

	logoutUser = (event) => {
    event.preventDefault()
    sessionStorage.setItem('userAuth', 'false');
    sessionStorage.removeItem('userToken');
    this.props.checkSessionStorage()
  }

	render() {
		
    return (
      <div className="Logout">
        <button className="LogoutButton" onClick={this.logoutUser}>Logout</button>
      </div>
		)
	}
}

export default Logout;