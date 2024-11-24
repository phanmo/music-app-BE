const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const PlaylistItems = new Scheme({
    id_playlist: {type: Scheme.Types.ObjectId, ref: 'playlist'},
    id_track: {type: String},
    name:{type: String},
    image_url:{type: String},
    preViewUrl:{type: String},
    artist: {type: String},
    album: {type: String}
},{
    timestamps: true
})
module.exports = mongoose.model('playlistItem', PlaylistItems)

