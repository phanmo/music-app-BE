const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const FavoriteItems = new Scheme({
    id_favorite: {type: Scheme.Types.ObjectId, ref: 'favorite'},
    id_track: {type: String},
    name:{type: String},
    image_url:{type: String},
    preViewUrl:{type: String},
    artist: {type: String}
},{
    timestamps: true
})

module.exports = mongoose.model('favoriteItem', FavoriteItems)