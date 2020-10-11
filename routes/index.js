var express = require('express')
require('dotenv').config()
let User = require('../models/user')
let Post = require('../models/post')
const { body, sanitize, validationResult } = require('express-validator')
var router = express.Router()
let bcrypt = require('bcryptjs')
const passport = require('passport')
const session = require('express-session')
const { deleteOne } = require('../models/user')
const LocalStrategy = require('passport-local').Strategy

router.use((req, res, next) => {
	res.locals.user = req.user
	next()
})

/* GET home page. */
router.get('/', function (req, res, next) {
	Post.find({})
		.populate('author')
		.exec((err, posts) => {
			if (err) return next(err)

			res.render('index', { title: 'Message Board', user: res.locals.user, posts: posts })
		})
})

// POST home page.
router.post(
	'/log-in',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/'
	})
)

// GET sign-up page
router.get('/sign-up', (req, res, next) => {
	res.render('user_form', { title: 'Sign Up' })
})

// POST sign-up page
router.post('/sign-up', [
	// Validate Fields
	body('first', 'First Name must not be empty.').trim().isLength({ min: 1 }),
	body('last', 'Last Name must not be empty.').trim().isLength({ min: 1 }),
	body('username', 'Email must be an email').isEmail(),
	body('password', 'Password must be at least 5 characters long!').isLength({ min: 5 }),
	body('confirm_password', 'Passwords must match!')
		.exists()
		.custom((value, { req }) => value === req.body.password),

	// Sanitize fields
	sanitize('first').escape(),
	sanitize('last').escape(),
	sanitize('username').escape(),
	sanitize('password').escape(),
	sanitize('confirm_password').escape(),

	// Process request after validation
	(req, res, next) => {
		// Extract errors
		const errors = validationResult(req)

		// Encrypt password
		bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
			if (err) return next(err)

			// Create new user with hashed password
			let user = new User({
				first: req.body.first,
				last: req.body.last,
				username: req.body.username,
				password: hashedPassword,
				membership: false,
				admin: req.body.admin == 'on'
			})

			if (!errors.isEmpty()) {
				// There are errors, re-render form
				res.render('user_form', {
					title: 'Sign Up',
					user: user,
					errors: errors.array()
				})
				return
			} else {
				// Data from form is valid. Save the user and redirect
				user.save(function (err) {
					if (err) return next(err)

					// Success, redirect
					res.redirect('/')
				})
			}
		})
	}
])

// GET Membership
router.get('/membership', function (req, res, next) {
	res.render('membership_form')
})

// POST Membership
router.post('/membership', (req, res, next) => {
	let password = req.body.membership
	console.log(password)
	if (password == process.env.DB_MEM_PASS) {
		console.log('granted')
		User.findByIdAndUpdate(res.locals.user, { membership: true }, function (err, user) {
			if (err) return next(err)
			res.redirect('/')
		})
	} else if (password == process.env.DB_MEM_REM) {
		console.log('removed')
		User.findByIdAndUpdate(res.locals.user, { membership: false }, function (err, user) {
			if (err) return next(err)
			res.redirect('/')
		})
	} else {
		res.redirect('/membership')
	}
})

// GET logout
router.get('/log-out', (req, res) => {
	req.logout()
	res.redirect('/')
})

module.exports = router
