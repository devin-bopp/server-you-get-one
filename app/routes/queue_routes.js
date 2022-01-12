const express = require('express')
const passport = require('passport')

const Queue = require('../models/queue')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// get current user's queue position
router.get('/queue', requireToken, (req, res, next) => {
    Queue.find({ owner: req.user._id })
        .then(queue => {
            res.status(200).json(queue)
        })
        .catch(next)
})

// get full sorted queue
router.get('/queue/sort', requireToken, (req,res,next) => {
    Queue.find({})
        .sort({'dateCreated': 'desc'})
        .populate({path: 'owner', select: 'email'})
        .then(queues => {
            res.status(201).json(queues)
        })
        .catch(next)
})

// add user to queue
router.post('/queue', requireToken, (req, res, next) => {
    Queue.create(req.body)
        .then(queue => {
            res.status(201).json({queue: queue.toObject()})
        })
        .catch(next)
})




module.exports = router