let mongoose = require('mongoose')

let Schema = mongoose.Schema

let PostSchema = new Schema({
	title: { type: String, required: true, maxlength: 100 },
	timestamp: { type: Date, required: true },
	message: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

// Virtual
PostSchema.virtual('url').get(function () {
	return `/post/${this._id}`
})

module.exports = mongoose.model('Post', PostSchema)
