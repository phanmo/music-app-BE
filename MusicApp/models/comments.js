const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Comments = new Scheme({
    id_user: {type: String},
    id_track: {type: String},
    avatar: {type: String},
    username:{type:String},
    content: {type: String, maxLength: 255},
    time: { type: Date, default: Date.now }
},{
    timestamps: true
})

module.exports = mongoose.model('comment', Comments)