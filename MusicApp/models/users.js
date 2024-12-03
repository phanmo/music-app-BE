const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Users = new Scheme({
    username : {type: String,  maxLength: 255},
    password: {type: String, maxLength: 255},
    email: {type: String, unique: true},
    name: {type: String},
    avatar: {type: String, default: ""},
    birthday: {type: Date, default: ""},
    coin: {type: Number, default: 0},
    available: {type: Boolean, default: false}
},{
    timestamps: true
})

module.exports = mongoose.model('user', Users)
