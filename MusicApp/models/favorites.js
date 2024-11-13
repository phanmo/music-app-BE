const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Favorites = new Scheme({
    id_user: {type: String},
    favoriteItems: [{ type: Scheme.Types.ObjectId, ref: 'favoriteItem' }]
},{
    timestamps: true
})

module.exports = mongoose.model('favorite', Favorites)