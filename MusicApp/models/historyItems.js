const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const HistoryItems = new Scheme({
    id_history: {type: Scheme.Types.ObjectId, ref: 'history'},
    id_track: {type: String},
    name:{type: String},
    image_url:{type: String},
    preViewUrl:{type: String},
    artist: {type: String}
},{
    timestamps: true
})

module.exports = mongoose.model('historyItem', HistoryItems)