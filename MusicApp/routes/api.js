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
const Comments = require('../models/comments');
const Upload = require('../config/upload');

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
                data: []
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

            // Lấy danh sách các playlist của người dùng sau khi thêm playlist mới
            const playlists = await Playlists.find({ id_user }).populate('playlistItems');

            // Trả về danh sách playlist với count playlistItems
            const response = playlists.map(playlist => ({
                _id: playlist._id,
                name: playlist.name,
                count: playlist.playlistItems.length // Số lượng playlistItems trong mỗi playlist
            }));

            return res.json({
                status: 200,
                message: "Thêm playlist thành công",
                data: response // Trả về danh sách playlist đã được tính số lượng playlistItems
            });
        } else {
            // Coin không đủ
            return res.status(400).json({
                status: 400,
                message: "Coin không đủ để tạo playlist",
                data: []
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
router.delete('/delete-playlist/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm playlist theo ID để lấy thông tin id_user trước khi xóa
        const playlist = await Playlists.findById(id);

        if (!playlist) {
            return res.json({
                status: 404,
                message: "Playlist không tồn tại",
                data: []
            });
        }

        const id_user = playlist.id_user;

        // Xóa các playlistItems liên quan đến playlist này trước
        await PlaylistItems.deleteMany({ id_playlist: id });

        // Xóa playlist
        const result = await Playlists.findByIdAndDelete(id);

        if (result) {
            // Lấy danh sách các playlist còn lại của user
            const playlists = await Playlists.find({ id_user });
            const response = playlists.map(playlist => ({
                _id: playlist._id,
                name: playlist.name,
                count: playlist.playlistItems.length // Số lượng playlistItems trong mỗi playlist
            }));

            return res.json({
                status: 200,
                message: "Xóa thành công",
                data: response
            });
        } else {
            return res.json({
                status: 400,
                message: "Lỗi, không thể xóa playlist",
                data: []
            });
        }
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
    }
});

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
// router.get('/get-list-playlist/:id_user', async (req, res) => {
//     try {
//         const { id_user } = req.params;
//         console.log('Requested id_user:', id_user);

//         const playlists = await Playlists.find({ id_user }).populate('playlistItems');
//         console.log('Playlists found:', playlists);

//         if (playlists.length > 0) {
//             res.json({
//                 "status": 200,
//                 "message": "Success",
//                 "data": playlists
//             });
//         } else {
//             res.status(400).json({
//                 "status": 400,
//                 "message": "Failed",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             "status": 500,
//             "message": "Server Error",
//             "error": error.message
//         });
//     }
// })

//-----Get playlist by user id
router.get('/get-playlist/:id_user', async (req, res) => {
    try {
        const { id_user } = req.params;

        // Truy vấn playlist
        const playlists = await Playlists.find({ id_user }).select('_id name playlistItems');

        if (playlists.length > 0) {
            // Thêm count thủ công vào kết quả
            const result = playlists.map(playlist => ({
                _id: playlist._id,
                name: playlist.name,
                count: playlist.playlistItems.length
            }));

            res.json({
                status: 200,
                message: "Success",
                data: result
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Failed",
                data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Server Error",
            error: error.message
        });
    }
});


//-----Get list playlist item by id_playlist
router.get('/get-list-playlist-item/:id_playlist', async (req, res) => {
    try {
        const { id_playlist } = req.params;

        // Lấy thông tin playlist
        const playlist = await Playlists.findById(id_playlist);

        if (!playlist) {
            return res.status(404).json({
                status: 404,
                message: "Playlist không tồn tại",
                data: {}
            });
        }

        // Lấy danh sách playlist items
        const playlistItems = await PlaylistItems.find({ id_playlist });

        res.json({
            status: 200,
            message: "Success",
            playlistName: playlist.name,
            data: playlistItems

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Server Error",
            error: error.message
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
                data: []
            });
        }

        // Lấy thông tin user từ playlist
        const user = await Users.findById(playlist.id_user);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: []
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
                data: []
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
                album: data.album
            });
            await newPlaylistItem.save();

            // Cập nhật playlist với playlistItem mới
            await Playlists.findByIdAndUpdate(data.id_playlist, { $push: { playlistItems: newPlaylistItem._id } });

            // Lấy danh sách PlaylistItems của id_playlist
            const playlistItems = await PlaylistItems.find({ id_playlist: data.id_playlist });

            return res.json({
                status: 200,
                message: "Thêm thành công",
                data: playlistItems
            });
        } else {
            // Coin không đủ
            return res.status(400).json({
                status: 400,
                message: "Coin không đủ để thêm bài hát vào playlist",
                data: []
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


//-----Delete playlist item by id
router.delete('/delete-playlist-item/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin PlaylistItem trước khi xoá
        const playlistItem = await PlaylistItems.findById(id);
        if (!playlistItem) {
            return res.json({
                status: 400,
                message: "Item không tồn tại",
                data: []
            });
        }

        // Xoá PlaylistItem
        const result = await PlaylistItems.findByIdAndDelete(id);
        if (result) {
            // Cập nhật mảng playlistItems trong Playlists
            await Playlists.updateOne(
                { _id: playlistItem.id_playlist },
                { $pull: { playlistItems: id } }
            );

            // Lấy danh sách các item còn lại trong cùng playlist
            const remainingItems = await PlaylistItems.find({
                id_playlist: playlistItem.id_playlist
            });

            return res.json({
                status: 200,
                message: "Xoá thành công",
                data: remainingItems
            });
        } else {
            return res.json({
                status: 400,
                message: "Lỗi, xoá không thành công",
                data: []
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
});

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
router.get('/get-history/:id_user', async (req, res) => {
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

        // Tách username từ email (phần trước @)
        const emailParts = data.email.split('@');
        const usernameFromEmail = emailParts[0];

        const newUser = new Users({
            username: usernameFromEmail, // Sử dụng username từ email
            password: data.password,
            email: data.email,
            name: data.name,
        });

        const result = await newUser.save();

        if (result) { // Gửi mail
            const mailOptions = {
                from: "kieumo54@gmail.com", // email gửi đi
                to: result.email,          // email nhận
                subject: "Đăng ký thành công", // tiêu đề
                text: "Cảm ơn bạn đã đăng ký", // nội dung email
            };

            // Gửi email
            await Transporter.sendMail(mailOptions);

            res.json({
                status: 200,
                message: "Đăng ký thành công",
                data: result,
            });
        } else { // Nếu thêm không thành công
            res.status(400).json({
                status: 400,
                message: "Lỗi, đăng ký không thành công",
                data: {},
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message,
        });
    }
});

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

//----- Add favorite
router.post('/add-favorite', async (req, res) => {
    try {
        const data = req.body;
        const newFavorite = new Favorites({
            id_user: data.id_user,
            id_track: data.id_track,
            name: data.name,
            image_url: data.image_url,
            preViewUrl: data.preViewUrl,
            artist: data.artist,
            album: data.album
        });
        const result = await newFavorite.save();
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

//-----Delete favorite by id
router.delete('/delele-favorite/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Favorites.findByIdAndDelete(id);
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
router.get('/get-favorite/:id_user', async (req, res) => {
    try {
        const { id_user } = req.params;

        const favorites = await Favorites.find({ id_user });

        if (favorites) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": favorites
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

        // Tìm thông tin user từ id_user
        const user = await Users.findById(data.id_user);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại",
                data: []
            });
        }

        // Kiểm tra số coin của user
        if (user.coin >= 3) {
            // Trừ 3 coin và lưu lại user
            user.coin -= 3;
            await user.save();

            // Tạo comment mới với avatar và username từ user
            const newComment = new Comments({
                id_user: data.id_user,
                id_track: data.id_track,
                avatar: user.avatar, // Lấy avatar từ user
                username: user.username, // Lấy username từ user
                content: data.content
            });
            await newComment.save();

            // Lấy danh sách comment theo id_track
            const comments = await Comments.find({ id_track: data.id_track }).sort({ createdAt: -1 });

            return res.json({
                status: 200,
                message: "Thêm thành công",
                data: comments
            });
        } else {
            // Coin không đủ
            return res.status(400).json({
                status: 400,
                message: "Coin không đủ để thêm comment",
                data: []
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

router.get('/get-comment-by-track-id/:id_track', async (req, res) => {
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

router.delete('/delete-comment/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm bình luận để lấy id_track trước khi xóa
        const commentToDelete = await Comments.findById(id);
        if (!commentToDelete) {
            return res.status(404).json({
                status: 404,
                message: "Bình luận không tồn tại",
                data: []
            });
        }

        const idTrack = commentToDelete.id_track;

        // Xóa bình luận
        const result = await Comments.findByIdAndDelete(id);

        if (result) {
            // Lấy danh sách bình luận theo id_track
            const comments = await Comments.find({ id_track: idTrack }).sort({ createdAt: -1 });

            return res.json({
                status: 200,
                message: "Xoá thành công",
                data: comments // Trả về danh sách bình luận
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: "Lỗi, xoá không thành công",
                data: []
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

//-----Get user order by coin
router.get('/get-users-order-by-coin', async (req, res) => {
    try {
        // Lấy danh sách người dùng sắp xếp theo coin giảm dần, giới hạn 15 người dùng
        const users = await Users.find()
            .sort({ coin: -1 })
            .limit(15);

        if (users.length > 0) {
            res.json({
                status: 200,
                message: "Danh sách người dùng sắp xếp theo coin",
                data: users
            });
        } else {
            res.status(404).json({
                status: 404,
                message: "Không có người dùng nào",
                data: []
            });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            status: 500,
            message: "Lỗi server",
            error: error.message
        });
    }
});

//-----Edit user profile
router.put('/edit-user-profile/:id', Upload.single('avatar'), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { file } = req;
        const updateUser = await Users.findById(id);
        
        if (updateUser) {
            updateUser.name = data.name ?? updateUser.name;
            updateUser.birthday = data.birthday ?? updateUser.birthday;
            updateUser.username = data.username ?? updateUser.username;
            if (file) {
                updateUser.avatar = `${req.protocol}s://${req.get("host")}/uploads/${file.filename}`;
            }
        }
        const result = await updateUser.save();

        if (result) {
            // Nếu thêm thành công result!null trả về dữ liệu
            res.json({
                "status": 200,
                "messenger": "Cập nhật thành công",
                "data": result
            })
        } else {
            // Nếu thêm ko thành công result=null, thông báo ko thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, cập nhật ko thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//-----Change-password
router.put('/change-password/:id', async (req, res) => {
    try {
        const { id } = req.params; // Lấy user ID từ params
        const { currentPassword, newPassword } = req.body; // Lấy dữ liệu từ body

        // Tìm user theo ID
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Người dùng không tồn tại"
            });
        }

        // Kiểm tra mật khẩu hiện tại
        if (currentPassword !== user.password) {
            return res.status(400).json({
                status: 400,
                message: "Mật khẩu hiện tại không đúng"
            });
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: 200,
            message: "Đổi mật khẩu thành công"
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

//------Get user
router.get('/get-user/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm người dùng theo ID
        const user = await Users.findById(id);
        if (user) {
            res.json({
                "status": 200,
                "message": "Success",
                "data": user
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Failed",
                "data": {}
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
})

module.exports = router;
