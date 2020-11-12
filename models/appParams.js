const mongoose = require('mongoose')

const appParamsSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	monthlyNeeds: {	type: Object, required: true },	
}, 
{ collection: 'appParams' }
)

module.exports = mongoose.model('AppParams', appParamsSchema)