const mongoose = require('mongoose')

//Mongo Schema
const Schema = mongoose.Schema
const IrrigateCauseSchema = new Schema({
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
	}
})

//Mongo Model
const IrrigateCause = mongoose.model('IrrigateCause', IrrigateCauseSchema)

module.exports = IrrigateCause