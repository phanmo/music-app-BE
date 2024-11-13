const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Playlists = new Scheme({
    id_user: {type: String},
    name: {type: String },
    playlistItems: [{ type: Scheme.Types.ObjectId, ref: 'playlistItem' }]
},{
    timestamps: true
})

module.exports = mongoose.model('playlist', Playlists)