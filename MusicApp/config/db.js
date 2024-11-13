const mongoose = require('mongoose');
mongoose.set('strictQuery', true)

const local = "mongodb://localhost:27017/MusicApp"

const atlat = "mongodb+srv://kieumo54:moho2106@cluster0.noi2p.mongodb.net/music_app"

const connect = async () => {
    try {
        await mongoose.connect(atlat, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('connect success')
    } catch (error) {
        console.log(error);
        console.log('connect fail');
    }
}
module.exports = { connect }