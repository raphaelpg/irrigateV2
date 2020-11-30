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
	    category: 'Animal Protection',
	    continent: 'Worldwide',
	    country: '',
	    address: '',
	    logo: '',
      logo64: '',
      logoSize: 0,
		};
	}

	handleChange = ({ target }) => {
    const { name, value } = target
    this.setState({ [name]: value })
  }

  //Save image file name and convert image into base64
  handleLogoChange = event => {
    let filesSelected = document.getElementById("file-uploaded").files;
    let fileSize = filesSelected[0].size
    if (filesSelected.length > 0 && fileSize <= 50000) {
      let fileToLoad = filesSelected[0];
      let fileReader = new FileReader();
      fileReader.onload = async (fileLoadedEvent) => {
        let srcData = await fileLoadedEvent.target.result; // <--- data: base64
        this.setState({
          logo64: srcData,
        })
      }
      fileReader.readAsDataURL(fileToLoad)
      let fileName = ''
      fileName = document.getElementById('file-uploaded').value
      let fileNameParsed = fileName.split("\\")
      document.getElementById('file-selected').innerHTML = ' ' + fileNameParsed[fileNameParsed.length - 1]
      this.setState({
        logo: event.target.files[0],
      })
    } else {
      alert('File size too big, image must be less than 60kb')
    }
  }

  submit = event => {
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
    payload.append('logo64', this.state.logo64)

    axios.post("/save", payload)
      .then(() => {
        alert('Success, your application has been sent for validation')
        this.resetUserInputs()
        this.props.getIrrigateCauses()
        this.props.closeFormAddCause()
      })
      .catch(() => {
        alert('Error, network or image size too large (less than 50kb)')
        console.log('Internal server error')
      })
    //Temporary disabled
    /*alert('Your cause has been sent for validation')
    this.resetUserInputs()
    this.props.getIrrigateCauses()
    this.props.closeFormAddCause()*/
  }

  resetUserInputs = () => {
    this.setState({
      name: '',
      description: '',
      link: '',
      category: 'Animal Protection',
      continent: 'Worldwide',
      country: '',
      address: '',
      logo: null,
      logo64: null,
    })
  }

	render() {
		let FormAddCause = (
      <Zoom duration={300}>
  			<div className="FormAddCause">
          <div className="FormAddCauseTitle_Close">
            <p className="FormAddCauseTitle">Tell us more about your association: </p>
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
            <label>Link to website</label>
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
              <select 
                name="category" 
                type="text" 
                value={this.state.category} 
                onChange={this.handleChange} 
              >
                <option value="Animal Protection">Animal Protection</option>
                <option value="Health">Health</option>
                <option value="Development">Development</option>
                <option value="Environment">Environment</option>
                <option value="Education">Education</option>
                <option value="Human Rights">Human Rights</option>
              </select>
            </div>
            <label>Continent</label>
            <div className="form-input">
              <select 
                name="continent" 
                type="text" 
                value={this.state.continent} 
                onChange={this.handleChange} 
              >
                <option value="Worldwide">Worldwide</option>
                <option value="Africa">Africa</option>
                <option value="America">America</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Oceania">Oceania</option>
                <option value="Poles">Poles</option>
              </select>
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
            <label>Upload a picture that will appear on the list (file size must be less than 60kb)</label>
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

            <button className ="FormAddCauseButton">Submit your application</button>
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