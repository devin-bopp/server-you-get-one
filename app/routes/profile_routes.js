const express = require('express')
const passport = require('passport')

const Profile = require('../models/profile')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

router.get('/profile', requireToken, (req, res, next) => {
    res.status(200).json({message: 'something'})
    // Profile.find()
    //     .then(profile => {
    //         return profile.toObject()
    //     })
    //     .then(profile => res.status(200).json({ message: "profile"}))
    //     .catch(next)
})

module.exports = router