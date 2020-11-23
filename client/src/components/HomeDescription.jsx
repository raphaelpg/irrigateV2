import React, { Component } from 'react'
import Fade from 'react-reveal/Fade'
import sfLogo from '../images/Superfluid_logo.png'

class HomeDescription extends Component {

	render() {
		return (
			<div className="HomeDescription">
				<div className="HomeDescriptionContainer">
					<div className="HomeDescriptionLeft">
						<Fade bottom duration={1000}>
		        	<h2 className="HomeDescriptionLeftTitle">Associations: register and receive donations from all over the world</h2>
		        	<button className="displayFormAddCauseButton" onClick={this.props.displayFormAddCause}>Register your association</button>
						</Fade>
	        </div>
	        <div className="HomeDescriptionRight">
						<Fade bottom duration={2000}>
		        	<h2 className="HomeDescriptionRightTitle">Donors: give directly or subscribe to a monthly donations</h2>
		        	<div className="HomeDescriptionRightButtonContainer">
			        	<button className="HomeDescriptionButton" onClick={this.props.displayOneTimeDonation}>One time donation</button>
				        <button className="HomeDescriptionButtonSuperfluid" onClick={this.props.displaySubscription}>
				        	<img className="SuperfluidLogo" src={sfLogo} alt="Superfluid logo" />
				        	<div className="SuperfluidLogoPhrase">Superfluid monthly subscription</div>
				        </button>
		        	</div>
						</Fade>
	      	</div>
	      </div>
      </div>
		)
	}
}

export default HomeDescription;