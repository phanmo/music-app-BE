var express = require('express');
var router = express.Router();

const Users = require('../models/users');
const Transporter = require('../config/mail');
const Playlists = require('../models/playlists');
const JWT = require('jsonwebtoken');
const SECRECT_KEY = "mophan";
const PlaylistItems = require('../models/playlistItems');
const Histories = require('../models/histories');
const HistoryItems = require('../models/historyItems');
const Favorites = require('../models/favorites');
const FavoriteItems = require('../models/favoriteItems');
const Comments = require('../models/comments');

//-----Add playlist
router.post('/add-playlist', async (req, res) => {
    try {
        const { id_user, name } = req.body; // Lấy dữ liệu từ body
        const newPlaylist = new Playlists({
            id_user: id_user, name
        });
        const result = await newPlaylist.save();
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

//-----Delete playlist by id
router.delete('/delele-playlist-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Playlists.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "message": "Xoá thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, xoá ko thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Get list playlist
router.get('/get-list-playlist', async (req, res) => {
    try {
        const data = await Playlists.find()
        .populate('playlistItems')
        .sort({ createAt: -1 });
        if (data) {
            res.json({
                "status": 200,
                "message": "Thành công",
                "data": data
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});
//-----Get list playlist by user id
router.get('/get-list-playlist/:id_user', async (req, res) => {
    try {
        const { id_user } = req.params;
        console.log('Requested id_user:', id_user);

        const playlists = await Playlists.find({ id_user }).populate('playlistItems');
        console.log('Playlists found:', playlists);
        
        if (playlists.length > 0) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": playlists
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Server Error",
            "error": error.message
        });
    }
});

//-----Get playlist by user id
router.get('/get-playlist/:id_user', async (req, res) => {
    try {
        const { id_user } = req.params;
        const playlists = await Playlists.find({ id_user }).select('_id name');
        if (playlists.length > 0) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": playlists
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Server Error",
            "error": error.message
        });
    }
});

//-----Get list playlist item by id_playlist
router.get('/get-list-playlist-item/:id_playlist', async (req, res) => {
    try {
        const { id_playlist } = req.params;
        const playlistItems = await PlaylistItems.find({ id_playlist });
        if (playlistItems.length > 0) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": playlistItems
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Server Error",
            "error": error.message
        });
    }
});

//-----Add playlist item
router.post('/add-playlist-item', async (req, res) => {
    try {
        const data = req.body;
        const newPlaylistItem = new PlaylistItems({
            id_playlist: data.id_playlist,
            id_track: data.id_track,
            name: data.name,
            image_url: data.image_url,
            preViewUrl: data.preViewUrl,
            artist: data.artist,
        });
        const result = await newPlaylistItem.save(); 
        await Playlists.findByIdAndUpdate(data.id_playlist, { $push: { playlistItems: result._id } });
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

//-----Delete playlist by id
router.delete('/delele-playlist-item-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PlaylistItems.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "message": "Xoá thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, xoá ko thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Add history
router.post('/add-history', async (req, res) => {
    try {
        const data = req.body; 
        const newHistory = new Histories({
            id_user: data.id_user,
        });
        const result = await newHistory.save(); 
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            // Nếu ko thành công, hiện thông báo
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

//-----Add history item
router.post('/add-history-item', async (req, res) => {
    try {
        const data = req.body; // Lấy dữ liệu từ body
        const newHistoryItem = new HistoryItems({
            id_history: data.id_history,
            id_track: data.id_track,
            name: data.name,
            image_url: data.image_url,
            preViewUrl: data.preViewUrl,
            artist: data.artist,
        });// Tạo một đối tượng mới
        const result = await newHistoryItem.save();
        await Histories.findByIdAndUpdate(data.id_history, { $push: { historyItems: result._id } });
        if (result) {
            // Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            // Nếu ko thành công, hiện thông báo
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Get history by user id
router.get('/get-history/:id_user', async(req, res)=>{
    try {
        const { id_user } = req.params;
        console.log('Requested id_user:', id_user);

        const history = await Histories.findOne({ id_user }).populate('historyItems');
        console.log('history found:', history);
        
        if (history != null) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": history
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Server Error",
            "error": error.message
        });
    }
})

//-----Get list history items by history id
router.get('/get-history-items/:id_history', async (req, res) => {
    try {
        const { id_history } = req.params;
        const historyItems = await HistoryItems.find({ id_history: id_history }).populate('id_history');
        if (historyItems.length > 0) {
            res.json({
                "status": 200,
                "message": "Get historyItems success",
                "data": historyItems
            });
        } else {
            res.json({
                "status": 400,
                "message": "Not found",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Delete history item by id
router.delete('/delele-history-item-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await HistoryItems.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "message": "Xoá thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, xoá ko thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Register
router.post('/register', async (req, res) => {
    try {
        const data = req.body;
        const newUser = Users({
            username: data.username,
            password: data.password,
            email: data.email,
            name: data.name,
            avatar: data.avatar,
        })
        const result = await newUser.save()
        if (result) { //Gửi mail
            const mailOptions = {
                from: "kieumo54@gmail.com", //email gửi đi
                to: result.email, // email nhận
                subject: "Đăng ký thành công", //subject
                text: "Cảm ơn bạn đã đăng ký", // nội dung mail
            };
            // Nếu thêm thành công result !null trả về dữ liệu
            await Transporter.sendMail(mailOptions); // gửi mail
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {// Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email, password })
        if (user) {
            //Token người dùng sẽ sử dụng gửi lên trên header mỗi lần muốn gọi api
            const token = JWT.sign({ id: user._id }, SECRECT_KEY, { expiresIn: '1h' });
            //Khi token hết hạn, người dùng sẽ call 1 api khác để lấy token mới
            //Lúc này người dùng sẽ truyền refreshToken lên để nhận về 1 cặp token,refreshToken mới
            //Nếu cả 2 token đều hết hạn người dùng sẽ phải thoát app và đăng nhập lại
            const refreshToken = JWT.sign({ id: user._id }, SECRECT_KEY, { expiresIn: '1d' })
            //expiresIn thời gian token
            res.json({
                "status": 200,
                "message": "Đăng nhập thành công",
                "data": user,
                "token": token,
                "refreshToken": refreshToken
            })
        } else {
            // Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "message": "Lỗi, đăng nhập không thành công",
                "data": {}
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Add favorite
router.post('/add-favorite', async (req, res) => {
    try {
        const data = req.body; 
        const newFavorite = new Favorites({
            id_user: data.id_user,
        });
        const result = await newFavorite.save(); 
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            // Nếu ko thành công, hiện thông báo
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

//----- Add favorite item
router.post('/add-favorite-item', async(req, res)=>{
    try {
        const data = req.body;
        const newFavoriteItem = new FavoriteItems({
            id_favorite: data.id_favorite,
            id_track: data.id_track,
            name: data.name,
            image_url: data.image_url,
            preViewUrl: data.preViewUrl,
            artist: data.artist,
        });
        const result = await newFavoriteItem.save();
        await Favorites.findByIdAndUpdate(data.id_favorite, { $push: { favoriteItems: result._id } });
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Delete favorite item by id
router.delete('/delele-favorite-item-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await FavoriteItems.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "message": "Xoá thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, xoá ko thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Get favorite by user id
router.get('/get-favorite/:id_user', async(req, res)=>{
    try {
        const { id_user } = req.params;

        const favorite = await Favorites.findOne({ id_user }).populate('favoriteItems');
        
        if (favorite) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": favorite
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Server Error",
            "error": error.message
        });
    }
})

router.post('/add-comment', async(req, res)=>{
    try {
        const data = req.body;
        const newComment = new Comments({
            id_user: data.id_user,
            id_track: data.id_track,
            content: data.content
        });
        const result = await newComment.save();
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/get-comment-by-track-id/:id_track', async(req, res)=>{
    try {
        const { id_track } = req.params;
        const comments = await Comments.find({ id_track });   
        if (comments.length > 0) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": comments
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Server Error",
            "error": error.message
        });
    }
})

router.delete('/delete-comment/:id', async(req, res)=>{
    try {
        const { id } = req.params;
        const result = await Comments.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "message": "Xoá thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "message": "Lỗi, xoá ko thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.put('/encrease-point' , async(req, res)=>{
    try {
        const result = await Users.findByIdAndUpdate()
    } catch (error) {
        
    }
})
router.put('/decrease-point' , async(req, res)=>{
})
module.exports = router;
