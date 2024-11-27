const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Favorites = new Scheme({
    id_user: {type: Scheme.Types.ObjectId, ref: 'user'},
    id_track: {type: String},
    name:{type: String},
    image_url:{type: String},
    preViewUrl:{type: String},
    artist: {type: String},
    album: {type: String}
},{
    timestamps: true
})

module.exports = mongoose.model('favorite', Favorites)