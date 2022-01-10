const express = require('express')
const passport = require('passport')

const Profile = require('../models/profile')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// get current user's profile
router.get('/profile', requireToken, (req, res, next) => {
    Profile.find({ owner: req.user._id })
        .then(profile => {
            res.status(200).json(profile)
        })
        .catch(next)
})

// create a new profile for the current user
router.post('/profile', requireToken, (req, res, next) => {
    Profile.create(req.body)
        .then(profile => {
            res.status(201).json({ profile: profile.toObject() })
        })
        .catch(next)
})

module.exports = router