import React, { Component } from 'react';
import Fade from 'react-reveal/Fade'

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
		        	<h2 className="HomeDescriptionRightTitle">Donors: browse associations by causes and locations.<br />Send funds directly or subscribe to a monthly donations</h2>
						</Fade>
	      	</div>
	      </div>
      </div>
		)
	}
}

export default HomeDescription;