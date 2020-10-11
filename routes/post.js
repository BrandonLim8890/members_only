var express = require('express')
const { body, sanitize, validationResult } = require('express-validator')
let User = require('../models/user')
let Post = require('../models/post')
var router = express.Router()

router.use((req, res, next) => {
	res.locals.user = req.user
	next()
})

// GET post form
router.get('/new', (req, res, next) => {
	res.render('post_form')
})

// POST post form.
router.post('/new', [
	// Validate fields
	body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
	body('message', 'Message must not be empty.').trim().isLength({ min: 1 }),

	// Sanitize fields
	sanitize('title').escape(),
	sanitize('message').escape(),

	// Process request after validation
	(req, res, next) => {
		// Extract errors
		const errors = validationResult(req)

		// Create new post
		let post = new Post({
			title: req.body.title,
			timestamp: new Date(),
			message: req.body.message,
			author: res.locals.user
		})

		console.log(post)

		if (!errors.isEmpty()) {
			// There are errors, re-render form
			res.render('post_form', {
				post: post,
				errors: errors.array()
			})
			return
		} else {
			// Data from form is valid. Save the post and redirect
			post.save((err) => {
				if (err) return next(err)
				console.log(post.url)
				res.redirect(post.url)
			})
		}
	}
])

// POST delete post
router.post('/:id/delete', (req, res, next) => {
	Post.findByIdAndDelete(req.body.postid, function (err, result) {
		if (err) return next(err)
		res.redirect('/')
	})
})

// GET post detail.
router.get('/:id', (req, res, next) => {
	Post.findById(req.params.id)
		.populate('author')
		.exec(function (err, post) {
			if (err) return next(err)

			// Success so render page
			res.redirect('/')
		})
})

module.exports = router
