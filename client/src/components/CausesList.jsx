import React, { Component } from 'react'
import Fade from 'react-reveal/Fade'
const animal = require('./animal.png')
const development = require('./development.png')
const education = require('./education.png')
const environment = require('./environment.png')
const health = require('./health.png')
const human_rights = require('./human_rights.png')
const america = require('./america.png')
const africa = require('./africa.png')
const asia = require('./asia.png')
const europe = require('./europe.png')
const oceania = require('./oceania.png')
const poles = require('./iceberg.png')
const planet = require('./planet.png')
const globe = require('./globe.png')

class CausesList extends Component {
  constructor(props){
    super(props);
    this.state = {
      category_filter: 'All',
      location_filter: 'Anywhere'
    };
  }

  displayIrrigateCauses = (causes) => {
    if (!causes) return null
    if (this.state.category_filter === 'All' && this.state.location_filter === 'Anywhere') {
      return causes.map( (cause, index) => (
        <Fade duration={1000} key={index}>
          <div className="causeDisplay">
            <div className="causeLogoContainer">
              <img className="causeLogo" src={cause.logoName} alt={cause.name} />
            </div>
            <h3>{cause.name}</h3>
            <p>{cause.category}</p>
            <p>Activity's location: {cause.continent}, {cause.country}</p>
            <p>{cause.description}</p>
            <a href={cause.link} target="_blank" rel="noopener noreferrer">{cause.link}</a>
            <p className="causeNumber">Monthly donors: 2000 persons</p>
            <p className="causeNumber">Monthly donations: 1500 DAI</p>
            <p className="causeNumber">Total funds raised: 23500 DAI</p>
            <button className="addCauseToYourListButton" name={cause._id} onClick={this.props.addCauseToUserList} >Add cause to your donation stream</button>
          </div>
        </Fade>
      ))
    }
    else if (this.state.category_filter === 'All' && this.state.location_filter !== 'Anywhere') {
      let result = causes.filter(cause => {
        return (cause.continent === this.state.location_filter || cause.continent === 'Worldwide')
      })
      return result.map( (cause, index) => (
        <Fade duration={1000} key={index}>
          <div className="causeDisplay">
            <div className="causeLogoContainer">
              <img className="causeLogo" src={cause.logoName} alt={cause.name} />
            </div>
            <h3>{cause.name}</h3>
            <p>{cause.category}</p>
            <p>Activity's location: {cause.continent}, {cause.country}</p>
            <p>{cause.description}</p>
            <a href={cause.link} target="_blank" rel="noopener noreferrer">{cause.link}</a>
            <p className="causeNumber">Monthly donors: 2000 persons</p>
            <p className="causeNumber">Monthly donations: 1500 DAI</p>
            <p className="causeNumber">Total funds raised: 23500 DAI</p>
            <button className="addCauseToYourListButton" name={cause._id} onClick={this.props.addCauseToUserList} >Add cause to your donation stream</button>
          </div>
        </Fade>
      ))  
    }
    else if (this.state.category_filter !== 'All' && this.state.location_filter === 'Anywhere') {
      let result = causes.filter(cause => {
        return (cause.category === this.state.category_filter)
      })
      return result.map( (cause, index) => (
        <Fade duration={1000} key={index}>
          <div className="causeDisplay">
            <div className="causeLogoContainer">
              <img className="causeLogo" src={cause.logoName} alt={cause.name} />
            </div>
            <h3>{cause.name}</h3>
            <p>{cause.category}</p>
            <p>Activity's location: {cause.continent}, {cause.country}</p>
            <p>{cause.description}</p>
            <a href={cause.link} target="_blank" rel="noopener noreferrer">{cause.link}</a>
            <p className="causeNumber">Monthly donors: 2000 persons</p>
            <p className="causeNumber">Monthly donations: 1500 DAI</p>
            <p className="causeNumber">Total funds raised: 23500 DAI</p>
            <button className="addCauseToYourListButton" name={cause._id} onClick={this.props.addCauseToUserList} >Add cause to your donation stream</button>
          </div>
        </Fade>
      ))  
    }
    else if (this.state.category_filter !== 'All' && this.state.location_filter !== 'Anywhere') {
      let result = causes.filter(cause => cause.category === this.state.category_filter && (cause.continent === this.state.location_filter || cause.continent === 'Worldwide'))
      return result.map( (cause, index) => (
        <Fade duration={1000} key={index}>
          <div className="causeDisplay">
            <div className="causeLogoContainer">
              <img className="causeLogo" src={cause.logoName} alt={cause.name} />
            </div>
            <h3>{cause.name}</h3>
            <p>{cause.category}</p>
            <p>Activity's location: {cause.continent}, {cause.country}</p>
            <p>{cause.description}</p>
            <a href={cause.link} target="_blank" rel="noopener noreferrer">{cause.link}</a>
            <p className="causeNumber">Monthly donors: 2000 persons</p>
            <p className="causeNumber">Monthly donations: 1500 DAI</p>
            <p className="causeNumber">Total funds raised: 23500 DAI</p>
            <button className="addCauseToYourListButton" name={cause._id} onClick={this.props.addCauseToUserList} >Add cause to your donation stream</button>
          </div>
        </Fade>
      ))  
    }
  }

  handleChange = ({ target }) => {
    const { name, value } = target
    this.setState({ [name]: value })
  }

  handleCategoryClick = ({ target }) => {
    if (target.title) {
      this.setState({ category_filter: target.title})
    } else if (target.innerHTML) {
      this.setState({ category_filter: target.innerHTML})
    } else {
      this.setState({ category_filter: target.name})
    }
  }

  handleLocationClick = ({ target }) => {
    if (target.title) {
      this.setState({ location_filter: target.title})
    } else if (target.innerHTML) {
      this.setState({ location_filter: target.innerHTML})
    } else {
      this.setState({ location_filter: target.name})
    }
  }

	render() {
    console.log(this.state)
		return (
			<div className="irrigateCausesList">
        <div className="causesListFilterContainer">
          <div className="filterTitleContainer">
            <p className="causesListFilterTitle">Category:</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="All">
            <img className="causeFilterLogo" name="All" src={planet} alt="earth logo"></img>
            <p className="causesListFilterName" >All</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="Animal Protection">
            <img className="causeFilterLogo" name="Animal Protection" src={animal} alt="animal logo"></img>
            <p className="causesListFilterName" >Animal Protection</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="Health">
            <img className="causeFilterLogo" name="Health" src={health} alt="health logo"></img>
            <p className="causesListFilterName" >Health</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="Development">
            <img className="causeFilterLogo" name="Development" src={development} alt="development logo"></img>
            <p className="causesListFilterName" >Development</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="Environment">
            <img className="causeFilterLogo" name="Environment" src={environment} alt="environment logo"></img>
            <p className="causesListFilterName" >Environment</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="Education">
            <img className="causeFilterLogo" name="Education" src={education} alt="education logo"></img>
            <p className="causesListFilterName" >Education</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleCategoryClick} title="Human Rights">
            <img className="causeFilterLogo" name="Human Rights" src={human_rights} alt="human_rights logo"></img>
            <p className="causesListFilterName" >Human Rights</p>
          </div>
        </div>
        <div className="causesListFilterContainer">
          <div className="filterTitleContainer">
            <p className="causesListFilterTitle">Location:</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="Anywhere">
            <img className="causeFilterLogo" name="Anywhere" src={globe} alt="globe logo"></img>
            <p className="causesListFilterName" >Anywhere</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="Africa">
            <img className="causeFilterLogo" name="Africa" src={africa} alt="africa continent logo"></img>
            <p className="causesListFilterName" >Africa</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="America">
            <img className="causeFilterLogo" name="America" src={america} alt="america continent logo"></img>
            <p className="causesListFilterName" >America</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="Asia">
            <img className="causeFilterLogo" name="Asia" src={asia} alt="asia continent logo"></img>
            <p className="causesListFilterName" >Asia</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="Europe">
            <img className="causeFilterLogo" name="Europe" src={europe} alt="europe continent logo"></img>
            <p className="causesListFilterName" >Europe</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="Oceania">
            <img className="causeFilterLogo" name="Oceania" src={oceania} alt="oceania continent logo"></img>
            <p className="causesListFilterName" >Oceania</p>
          </div>
          <div className="filterAndLogoContainer" onClick={this.handleLocationClick} title="Poles">
            <img className="causeFilterLogo" name="Poles" src={poles} alt="iceberg logo representing north and south poles"></img>
            <p className="causesListFilterName" >Poles</p>
          </div>
        </div>
        <div className="causesListContainer">
          {this.displayIrrigateCauses(this.props.causes)}
        </div>
      </div>
		)
	}
}

export default CausesList;