const bodyParser = require('body-parser') 
const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt')
const session = require('express-session');
const { DEC8_BIN } = require('mysql/lib/protocol/constants/charsets');
const db = require('./models/index.js');
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
        console.log("チェック");
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
            console.log("チェック2");
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
    console.log("チェック3");
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


// --------- 中身の機能 ----------


app.get('/top', (req, res) => {
    db.Post.findAll()
    .then((result) => {
      res.render('top.ejs',{post:result})
    })
})

app.get('/detail/:id', (req, res) => {
    db.Post.findAll({
        where:{
            id:req.params.id
        }
    })
    .then((result) => {
        res.render('detail.ejs',{post:result[0]})
    })
});

app.get('/new', (req, res) => {
    res.render('new.ejs');
  });

app.post('/create', (req, res) => {
    db.Post.create({
        title:req.body.title,
        text:req.body.text,
        area:req.body.area
    })
    .then((tmp) => {
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
    console.log(req);
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


app.get('/message', (req, res) => {
    res.render('message.ejs');
});

app.get('/profile/:id', (req, res) => {
    db.User.findAll({
        where:{
            id:req.params.id
        },
        // include:[{
        //     model:db.Post,
        //     required:false
        // }]
    })
    .then((result) => {
        console.log('ログインID:',req.session.userId);
        console.log('ログインID:',typeof(req.session.userId));
        console.log('訪問先ID:',req.params.id);
        console.log('ログインID:',typeof(req.params.id));
        if(String(req.session.userId) === req.params.id){
            res.render('mypage.ejs',{user:result[0]});
        }else{
            res.render('profile.ejs',{user:result[0]});
        }
    })
})




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

app.listen(3000);