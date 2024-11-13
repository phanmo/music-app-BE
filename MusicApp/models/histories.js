const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Histories = new Scheme({
    id_user: {type: String},
    historyItems: [{ type: Scheme.Types.ObjectId, ref: 'historyItem' }]
},{
    timestamps: true
})

module.exports = mongoose.model('history', Histories)