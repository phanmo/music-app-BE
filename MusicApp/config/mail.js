const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'kieumo54@gmail.com',
        pass: 'gtlc ffct oebx phck'
    }
});
module.exports = transporter;