const mongoose = require('mongoose')

//Mongo Schema
const Schema = mongoose.Schema
const IrrigateCauseV2Schema = new Schema({
	name: String, 
	description: String,
	category: String,
	continent: String,
	country: String,
	logoName: String,
	address: String,
	link: String,
	date: {
		type: String,
		default: Date.now()
	},
	logo: String,
})

//Mongo Model
const IrrigateCauseV2 = mongoose.model('IrrigateCauseV2', IrrigateCauseV2Schema)

module.exports = IrrigateCauseV2