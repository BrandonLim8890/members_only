var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')
require('dotenv').config()
const bcrypt = require('bcryptjs')
var indexRouter = require('./routes/index')
var postRouter = require('./routes/post')
var app = express()

var mongoose = require('mongoose')
var mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-xkt8e.mongodb.net/${process.env.DB_DB}?retryWrites=true&w=majority`
mongoose.connect(mongoDB, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// Passport config
passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username: username }, (err, user) => {
			if (err) return next(err)
			if (!user) return done(null, false, { msg: 'Incorrect Email' })
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					// Passwords match! Log user in
					return done(null, user)
				} else {
					// Passwords do not match
					return done(null, false, { msg: 'Incorrect Password' })
				}
			})
		})
	})
)

passport.serializeUser((user, done) => {
	done(null, user.id)
})

passport.deserializeUser((id, done) => {
	User.findById(id, function (err, user) {
		done(err, user)
	})
})

app.use(function (req, res, next) {
	res.locals.user = req.user
	next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Passport login
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/post', postRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
exports.passport = passport
