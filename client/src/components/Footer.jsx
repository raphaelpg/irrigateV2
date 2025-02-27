import React, { Component } from 'react';
const logo = require('../images/planet.png')

class Footer extends Component {

	render() {
		return (
			<div className="Footer">
				<div className="FooterContainer">
					<img className="FooterLogo" src={logo} alt="Irrigate logo"></img>
					<div className="FooterDescription">IRRIGATE -&nbsp;<a className="githubLogo" href="https://github.com/raphaelpg/irrigateV2" target="_blank" rel="noopener noreferrer">Github</a></div>
	      </div>
      </div> 
		)
	}
}

export default Footer;