import React, { Component } from 'react';
import Fade from 'react-reveal/Fade'

class HomeDescription extends Component {

	render() {
		return (
			<div className="HomeDescription">
				<div className="HomeDescriptionContainer">
					<div className="HomeDescriptionLeft">
						<Fade bottom duration={1000}>
		        	<h2 className="HomeDescriptionLeftTitle">Browse and select projects by purpose</h2>
						</Fade>
	        </div>
	        <div className="HomeDescriptionRight">
						<Fade bottom duration={2000}>
		        	<h2 className="HomeDescriptionRightTitle">View and manage your donations easily</h2>
						</Fade>
	      	</div>
	      </div>
      </div> 
		)
	}
}

export default HomeDescription;