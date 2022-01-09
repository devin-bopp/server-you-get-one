const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema(
    {
        // screen name for display in chat
        name: {
            type: String,
            required: true,
            unique: true,
            minlength: 6,
            maxlength: 20
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Profile', profileSchema)