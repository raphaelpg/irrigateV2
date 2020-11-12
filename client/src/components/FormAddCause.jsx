import React, { Component } from 'react'
import axios from 'axios'
import Zoom from 'react-reveal/Zoom'

class FormAddCause extends Component {
	constructor(props){
		super(props);
		this.state = {
			name: '',
	    description: '',
      link: '',
	    category: '',
	    continent: '',
	    country: '',
	    address: '',
	    logo: null,
		};
	}

	handleChange = ({ target }) => {
    const { name, value } = target
    this.setState({ [name]: value })
  }

  handleLogoChange = event => {
    this.setState({
      logo: event.target.files[0]
    })
    let fileName = ''
    fileName = document.getElementById('file-uploaded').value
    let fileNameParsed = fileName.split("\\")
    document.getElementById('file-selected').innerHTML = ' ' + fileNameParsed[fileNameParsed.length - 1]
  }

  submit = (event) => {
    event.preventDefault()
    const payload = new FormData()

    payload.append('name', this.state.name)
    payload.append('description', this.state.description)
    payload.append('link', this.state.link)
    payload.append('category', this.state.category)
    payload.append('continent', this.state.continent)
    payload.append('country', this.state.country)
    payload.append('address', this.state.address)
    payload.append('file', this.state.logo)

    axios.post("/save", payload)
      .then(() => {
        alert('Your cause has been sent for validation')
        this.resetUserInputs()
        this.props.getIrrigateCauses()
        this.props.closeFormAddCause()
      })
      .catch(() => {
        console.log('Internal server error')
      })
  }

  resetUserInputs = () => {
    this.setState({
      name: '',
      description: '',
      link: '',
      category: '',
      continent: '',
      country: '',
      address: '',
      logo: null,
    })
  }

	render() {

		let FormAddCause = (
      <Zoom duration={300}>
  			<div className="FormAddCause">
          <div className="FormAddCauseTitle_Close">
            <p className="FormAddCauseTitle">Tell us more about your cause: </p>
            <button className="closeFormAddCauseButton" onClick={this.props.closeFormAddCause}>x</button>
  				</div>
          <form className="FormAddCauseFields" onSubmit={this.submit} >
            <label>Name</label>
            <div className="form-input">
              <input 
                name="name" 
                type="text" 
                value={this.state.name} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Description</label>
            <div className="form-input">
              <textarea 
                name="description" 
                cols="30" 
                rows="10" 
                value={this.state.description} 
                onChange={this.handleChange} 
              >
              </textarea>
            </div>
            <label>Link</label>
            <div className="form-input">
              <input 
                name="link" 
                type="text" 
                value={this.state.link} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Category</label>
            <div className="form-input">
              <input 
                name="category" 
                type="text" 
                value={this.state.category} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Continent</label>
            <div className="form-input">
              <input 
                name="continent" 
                type="text" 
                value={this.state.continent} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Country</label>
            <div className="form-input">
              <input
                name="country" 
                type="text" 
                value={this.state.country} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Ethereum address that will receive the donations</label>
            <div className="form-input">
              <input
                name="address" 
                type="text" 
                value={this.state.address} 
                onChange={this.handleChange} 
              />
            </div>
            <label>Upload a picture that will appear on the list</label>
            <div className="form-input">
            <label className ="FormAddCauseButtonFileLabel">Choose a file: 
              <span id="file-selected"></span>
              <input
                id="file-uploaded"
                className="FormAddCauseButtonFile"
                name="file" 
                type="file"
                onChange={this.handleLogoChange} 
               />
            </label>
              
            </div>
            <button className ="FormAddCauseButton">Submit your cause</button>
          </form>
        </div>
      </Zoom> 
		)

    if (! this.props.displayFormAddCause) {
      FormAddCause = null;
    }

    return (
      <div>
        {FormAddCause}
      </div>
    )

	}
}

export default FormAddCause;