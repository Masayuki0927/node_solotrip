const bodyParser = require('body-parser') 
const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt')
const session = require('express-session');
const { DEC8_BIN } = require('mysql/lib/protocol/constants/charsets');
const db = require('./models/index.js');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const port = process.env.PORT || 8000;
// const { Model } = require('sequelize/dist');
require('date-utils');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
  );

app.use((req, res, next) => {
if (req.session.userId === undefined) {
    res.locals.username = 'ゲスト';
    res.locals.isLoggedIn = false;
} else {
    res.locals.username = req.session.username;
    res.locals.userid = req.session.userId;
    res.locals.isLoggedIn = true;
}
next();
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'test',
    database:'first_db'
  });

// connection.query('SELECT * FROM post', function (error, results, fields) {
// if (error) throw error;
// });


// --------- サインイン・ログイン機能 ----------

app.get('/signup', (req, res) => {
    res.render('signup.ejs',  { errors: [] });
});


app.post('/signup', (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];
    if (username === '') {
        errors.push('ユーザー名が空です');
      }
      if (email === '') {
        errors.push('メールアドレスが空です');
      }
      if (password === '') {
        errors.push('パスワードが空です');
      }
      if (errors.length > 0) {
        res.render('signup.ejs', { errors: errors });
      } else {
        next();
      }},
    (req, res, next) => {
        const errors = [];
        db.User.findAll({
            where:{
                email:req.body.email
            }
        })
        .then((tmp) => {
            if (tmp.length > 0) {
                errors.push('ユーザー登録に失敗しました');
                res.render('signup.ejs', { errors: errors });
                } else {
                next();
                }
            });   
        },
    (req, res) => {
    const password = req.body.password;
    bcrypt.hash(password, 10, (error, hash) => {
        db.User.create({
            username:req.body.username,
            email:req.body.email,
            password:hash
        })
    .then((result) => {
        req.session.userId = result.id;
        req.session.username = result.username;
        res.redirect('/top');
        }
    );
    })}
);


app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    db.User.findAll({
        where:{
            email:req.body.email
        }
    })
    .then((result) => {
        if (result.length > 0) {
            const plain = req.body.password
            const hash = result[0].password
            bcrypt.compare(plain,hash,(error,isEqual) => {
                if(isEqual){
                    req.session.userId = result[0].id;
                    req.session.username = result[0].username;
                    res.redirect('/top');
                  }else{
                    res.redirect('/login');
                  }
                }
            );
        }
    });
})


app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      res.redirect('/top');
    });
});


// ------------ 中身の機能 --------------

app.get('/test', (req, res) => {
    db.User.findAll({
        include: [{
            model:db.User,
            required:false
        }]
        }).then((result) => {
      res.send(result);
    })
})



app.get('/top', (req, res) => {
    db.Post.findAll()
    .then((result) => {
      res.render('top.ejs',{post:result})
    })
})

app.post('/search', (req, res) => {
    const  search  = req.body.keyword;
    db.Post.findAll({
        where:{
            title : {
                [Op.like]:`%${search}%`
            }
        }
    })
    .then((result) => {
        // res.send(result[0])
        res.render('search.ejs',{post:result})
    })
});


app.get('/detail/:id', (req, res) => {
    db.Post.findAll({
        where:{
            id:req.params.id
        },
        include:[{
            model:db.User,
            required:false
        }]
    })
    .then((result) => {
        // res.send(result[0])
        res.render('detail.ejs',{post:result[0]})
    })
});

app.get('/good/:id', (req, res) => {
    db.Post.findAll({
        where:{
            id:req.params.id
        }
    })
        .then((test) => {
        db.Post.update({
            good:test[0].good + 1
        },
        {
            where:{id:req.params.id}
        },
        )
        .then((tmp) => {
            db.Post.findAll({
                where:{
                    id:req.params.id
                },
                include:[{
                    model:db.User,
                    required:false
                }]
            })
            .then((result) => {
            res.render('detail.ejs',{post:result[0]})
            })
        })
    })
})

app.get('/new', (req, res) => {
    res.render('new.ejs');
  });

app.post('/create', (req, res) => {
    db.Post.create({
        title:req.body.title,
        text:req.body.text,
        area:req.body.area,
        userid:req.session.userId,
        good:1
    })
    .then((tmp) => {
        console.log('sessionID:',req.session.userId);
        console.log('type:',typeof(req.session.userId));
        console.log('userID:',tmp.userid);
        console.log('type:',typeof(tmp.userid));
        db.Post.findAll()
        .then((result) => {
        res.render('top.ejs',{post:result})
        })
    })
})

app.get('/edit/:id', (req, res) => {
    db.Post.findAll({
        where:{
            id:req.params.id
        }
    })
    .then((result) => {
        res.render('edit.ejs',{post:result[0]})
    })
})

app.post('/update/:id', (req, res) => {
    db.Post.update({
        title:req.body.title,
        text:req.body.text,
        area:req.body.area
    },
    {
        where:{id:req.params.id}
    })
    .then((tmp) => {
        db.Post.findAll()
        .then((result) => {
        res.render('top.ejs',{post:result})
        })
    })
})

app.post('/delete/:id', (req, res) => {
    db.Post.destroy({
        where:{id:req.params.id}
     })
     .then((tmp) => {
        db.Post.findAll()
        .then((result) => {
        res.render('top.ejs',{post:result})
        })
    })
});

app.get('/board', (req, res) => {
    db.Board.findAll()
    .then((result) => {
        res.render('board.ejs',{board:result})
    })
})

app.get('/create_board', (req, res) => {
    res.render('create_board.ejs');
});

app.post('/create_board', (req, res) => {
    db.Board.create({
        title:req.body.title
    })
    .then((tmp) => {
        db.Board.findAll()
        .then((result) => {
        res.render('board.ejs',{board:result})
        })
    })
})

app.get('/board_content/:id', (req, res) => {
    db.Board.findAll({
        where:{
            id:req.params.id
        },
        include:[{
            model:db.BoardContent,
            required:false
        }]
    })
    .then((result) => {
        // res.send(result[0].id.toString())
        res.render('board_content.ejs',{board:result[0]})
    })
})

app.post('/create_response/:id', (req, res) => {
    db.BoardContent.create({
        text:req.body.text,
        userid:req.session.userId,
        boardid:req.params.id
    })
    .then((tmp) => {
        db.Board.findAll({
            where:{
                id:req.params.id
            },
            include:[{
                model:db.BoardContent,
                required:false
            }]
        })
        .then((result) => {
            res.render('board_content.ejs',{board:result[0]})
        })
    })
})

app.post('/chatroom/:id', (req, res) => {
    db.Chatroom.create({
    })
    .then((result) => {
        console.log(result);
        db.Chatroomuser.bulkCreate([
            {chatroomid:result.id,userid:res.locals.userid},
            {chatroomid:result.id,userid:req.params.id}
        ])
        .then((tmp) => {
            res.render('chatroom.ejs');
        })    
    })
});

app.get('/chatroom', (req, res) => {
    // db.Chatroomuser.findAll({
    //     where:{
    //         userid:res.locals.userid
    //     }
    //     // include:[{
    //     //     model:db.Chatroom,
    //     //     required:false
    //     // }]
    // })
    // .then((result) => {
    //     // res.send(result);
    //     res.render('chatroom.ejs',{chatroomuser:result}); 
    // })
    db.Chatroom.findAll({
        include:[{
            model:db.Chatroomuser,
            required:false,
        }]
    })
    .then((result) => {
        res.render('chatroom.ejs',{chatroom:result});  
        // result.findAll({
        //     include:[{
        //         model:db.User,
        //         required:false,
        //     }]
        // })
        // .then((test) => {
        // res.send(test);
        // // res.render('chatroom.ejs',{chatroom:result});  
        // })
    })
});


app.get('/profile/:id', (req, res) => {
    db.User.findAll({
        where:{
            id:req.params.id
        },
        include:[{
            model:db.Post,
            required:false
        }]
    })
    .then((result) => {
        if(String(req.session.userId) === req.params.id){
            res.render('mypage.ejs',{user:result[0]});
        }else{
            // console.log('followid:',res.locals.userid);
            // console.log('followedid:',req.params.id);
            db.Follower_Followed.findAll({
                where:{
                    followid:res.locals.userid,
                    followedid:req.params.id
                }
            })
            .then((follow_result) => {
                console.log('follow_result.length:',follow_result.length);
                if(follow_result.length > 0){
                    follow = true;
                    db.Follower_Followed.findAll({
                        where:{
                            followid:req.params.id,
                            followedid:res.locals.userid
                        }
                    })
                    .then((Mutual_follow) => {
                        console.log("test4");
                        if(Mutual_follow.length > 0){
                            followed = true;
                            console.log("test0");
                            res.render('profile.ejs',{user:result[0],follow:follow, followed:followed});
                        }else{
                            followed = false;
                            console.log("test1");
                            res.render('profile.ejs',{user:result[0],follow:follow, followed:followed});
                        }
                    })
                }else{
                    follow = false;
                    followed = false;
                    console.log("test2");
                    res.render('profile.ejs',{user:result[0],follow:follow, followed:followed});
                };
            })
        }
    })
})


app.get('/follow/:id', (req, res) => {
    backURL=req.header('Referer') || '/';
    console.log(backURL);
    db.Follower_Followed.create({
        followid:res.locals.userid,
        followedid:req.params.id
    })
    .then((tmp) => {
        db.User.findAll({
            where:{
                id:req.params.id
            },
            include:[{
                model:db.Post,
                required:false
            }]
        })
        .then((result) => {
            res.redirect(backURL);
        })
    })
})


app.get('/unfollow/:id', (req, res) => {
    backURL=req.header('Referer') || '/';
    console.log(backURL);
    db.Follower_Followed.destroy({
        where:{
            followid:res.locals.userid,
            followedid:req.params.id
        }
     })
     .then((tmp) => {
        db.User.findAll({
            where:{
                id:req.params.id
            },
            include:[{
                model:db.Post,
                required:false
            }]
        })
        .then((result) => {
            res.redirect(backURL);
        })
    })
});


// -------------生のSQLを用いた記法-------------


// app.post('/signup', (req, res, next) => {
//     const username = req.body.username;
//     const email = req.body.email;
//     const password = req.body.password;
//     const errors = [];
//     if (username === '') {
//         errors.push('ユーザー名が空です');
//       }
  
//       if (email === '') {
//         errors.push('メールアドレスが空です');
//       }
  
//       if (password === '') {
//         errors.push('パスワードが空です');
//       }
//       if (errors.length > 0) {
//         res.render('signup.ejs', { errors: errors });
//       } else {
//         next();
//       }
//     },
//     (req, res, next) => {
//         const email = req.body.email;
//         const errors = [];
//         connection.query(
//             'SELECT * FROM users WHERE email = ?',
//             [email],
//             (error, results) => {
//                 if (results.length > 0) {
//                     errors.push('ユーザー登録に失敗しました');
//                     res.render('signup.ejs', { errors: errors });
//                   } else {
//                     next();
//                   }
//                 }
//             );   
//         },
//     (req, res) => {
//     const username = req.body.username;
//     const email = req.body.email;
//     const password = req.body.password;
//     bcrypt.hash(password, 10, (error, hash) => {
//         connection.query(
//             'insert into users (username, email, password) values(?,?,?)',
//             [username, email, hash],
//             (error, results) => {
//                 req.session.userId = results.insertId;
//                 req.session.username = username;
//                 res.redirect('/top');
//                 }
//             );
//         });
//     }
// );




// app.get('/detail/:id', (req, res) => {
//     connection.query(
//         'select * from post where id =?',
//         [req.params.id],
//         (error,results)=>{
//           res.render('detail.ejs', {post:results[0]});
//         }
//     )
// });

// app.post('/delete/:id', (req, res) => {
//     connection.query(
//         'delete from post where id =?',
//         [req.params.id],
//         (error,results)=>{
//           res.redirect('/index');
//         }
//     )
// });

// app.get('/edit/:id', (req, res) => {
//     connection.query(
//       'SELECT * FROM post WHERE id = ?',
//       [req.params.id],
//       (error, results) => {
//         res.render('edit.ejs', {post: results[0]});
//       }
//     );
//   });

// app.post('/update/:id', (req, res) => {
//     connection.query(
//      'update post SET title= ?, text= ?, area= ? WHERE id = ?',
//      [req.body.title,req.body.text,req.body.area, req.params.id],
//      (error, results) => {
//        res.redirect('/index');
//     });
// });

// app.get('/board_content/:id', (req, res) => {
//     db.Board.findAll()
//     .then((result) => {
//         res.render('board.ejs',{board:result})
//     })
// })

// app.listen(3000);

server.listen(port, () => {
    console.log("App is running on port " + port);
});