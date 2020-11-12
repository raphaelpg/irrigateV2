const mongoose = require('mongoose')

const batchSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	batch: { type: String, required: true },
	causes: { 
		type: Object, 
		required: true,
	},	
}, { collection: 'donations' }
)

module.exports = mongoose.model('Batch', batchSchema)