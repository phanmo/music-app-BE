const multer = require('multer');
const _storege = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploads = multer({
    storage: _storege,
    limits: {
        fieldSize: 5 * 1024 * 1024
    }
})
module.exports = uploads;