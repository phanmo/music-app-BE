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

        // Tìm user theo id_user
        const user = await Users.findById(id_user);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: {}
            });
        }

        // Kiểm tra số coin
        if (user.coin >= 5) {
            // Trừ 5 coin và lưu thông tin user
            user.coin -= 5;
            await user.save();

            // Tạo playlist mới
            const newPlaylist = new Playlists({
                id_user: id_user,
                name
            });

            const result = await newPlaylist.save();
            return res.json({
                status: 200,
                message: "Thêm thành công",
                data: result
            });
        } else {
            // Coin không đủ
            return res.status(400).json({
                status: 400,
                message: "Coin không đủ để tạo playlist",
                data: {}
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
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
                "data":{}
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

        // Lấy thông tin playlist để tìm id_user
        const playlist = await Playlists.findById(data.id_playlist).populate('id_user');
        if (!playlist) {
            return res.status(404).json({
                status: 404,
                message: "Playlist không tồn tại",
                data: {}
            });
        }

        // Lấy thông tin user từ playlist
        const user = await Users.findById(playlist.id_user);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: {}
            });
        }

        // Kiểm tra xem id_track đã tồn tại trong playlist chưa
        const isTrackExist = await PlaylistItems.findOne({
            id_playlist: data.id_playlist,
            id_track: data.id_track
        });

        if (isTrackExist) {
            return res.status(400).json({
                status: 400,
                message: "Bài hát đã tồn tại trong playlist",
                data: {}
            });
        }

        // Kiểm tra số coin của user
        if (user.coin >= 2) {
            // Trừ 2 coin và lưu lại user
            user.coin -= 2;
            await user.save();

            // Tạo PlaylistItem mới
            const newPlaylistItem = new PlaylistItems({
                id_playlist: data.id_playlist,
                id_track: data.id_track,
                name: data.name,
                image_url: data.image_url,
                preViewUrl: data.preViewUrl,
                artist: data.artist,
            });
            const result = await newPlaylistItem.save();

            // Cập nhật playlist với playlistItem mới
            await Playlists.findByIdAndUpdate(data.id_playlist, { $push: { playlistItems: result._id } });

            return res.json({
                status: 200,
                message: "Thêm thành công",
                data: result
            });
        } else {
            // Coin không đủ
            return res.status(400).json({
                status: 400,
                message: "Coin không đủ để thêm bài hát vào playlist",
                data: {}
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
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
                "data": {}
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
                "data": {}
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
                "data": {}
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
                "data": {}
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
            coin: data.coin,
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
                "data": {}
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
                "data": {}
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
                "data": {}
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
                "data": {}
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

router.post('/add-comment', async (req, res) => {
    try {
        const data = req.body;

        // Tìm thông tin user
        const user = await Users.findById(data.id_user);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: {}
            });
        }

        // Kiểm tra số coin của user
        if (user.coin >= 3) {
            // Trừ 3 coin và lưu lại user
            user.coin -= 3;
            await user.save();

            // Tạo comment mới
            const newComment = new Comments({
                id_user: data.id_user,
                id_track: data.id_track,
                content: data.content
            });
            const result = await newComment.save();

            return res.json({
                status: 200,
                message: "Thêm thành công",
                data: result
            });
        } else {
            // Coin không đủ
            return res.status(400).json({
                status: 400,
                message: "Coin không đủ để thêm comment",
                data: {}
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
    }
});

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
                "data": {}
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/add-coin', async (req, res) => {
    try {
        const { id_user } = req.body;

        // Tìm người dùng theo ID
        const user = await Users.findById(id_user);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: null
            });
        }

        // Cộng thêm 2 coin
        user.coin += 2;
        await user.save();

        // Phản hồi thành công
        res.json({
            status: 200,
            message: "Đã cộng 2 coin thành công",
            data: user.coin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
    }
});

router.get('/get-coin/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Tìm người dùng theo ID
        const user = await Users.findById(user_id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: null
            });
        }

        // Phản hồi chỉ với số coin
        res.json({
            status: 200,
            message: "Lấy thông tin coin thành công",
            data: user.coin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
    }
});



module.exports = router;
