let mongoose = require('mongoose')
require('mongoose-type-email')

let Schema = mongoose.Schema

let UserSchema = Schema({
	first: { type: String, required: true, maxlength: 100 },
	last: { type: String, required: true, maxlength: 100 },
	username: { type: mongoose.SchemaTypes.Email, required: true },
	password: { type: String, required: true },
	membership: { type: Boolean, required: true },
	admin: { type: Boolean, required: true }
})

// Virtual
UserSchema.virtual('url').get(function () {
	return `/user/${this._id}`
})

UserSchema.virtual('fullname').get(function () {
	return `${this.first} ${this.last}`
})

module.exports = mongoose.model('User', UserSchema)
