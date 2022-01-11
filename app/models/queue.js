const mongoose = require('mongoose')

const queueSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Queue', queueSchema)