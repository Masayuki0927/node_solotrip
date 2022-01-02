const bodyParser = require('body-parser') 
const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt')
const session = require('express-session');

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

// connection.connect();
 
connection.query('SELECT * FROM post', function (error, results, fields) {
if (error) throw error;
// console.log('test',results[0]);
});

app.get('/test', (req, res) => {
connection.query(
    'SELECT * FROM post',
    (error, results) => {
    res.render('test.ejs');
    }
);
});

// connection.end();

app.get('/top', (req, res) => {
  connection.query(
    'SELECT * FROM post',
    (error, results) => {
    res.render('top.ejs', {post: results});
    }
  );
});


app.get('/new', (req, res) => {
    res.render('new.ejs');
  });

app.get('/signup', (req, res) => {
    res.render('signup.ejs',  { errors: [] });
});

app.get('/board', (req, res) => {
    res.render('board.ejs');
});

app.get('/message', (req, res) => {
    res.render('message.ejs');
});

app.get('/profile', (req, res) => {
    res.render('profile.ejs');
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
      }
    },
    (req, res, next) => {
        const email = req.body.email;
        const errors = [];
        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            (error, results) => {
                if (results.length > 0) {
                    errors.push('ユーザー登録に失敗しました');
                    res.render('signup.ejs', { errors: errors });
                  } else {
                    next();
                  }
                }
            );   
        },
    (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 10, (error, hash) => {
        connection.query(
            'insert into users (username, email, password) values(?,?,?)',
            [username, email, hash],
            (error, results) => {
                req.session.userId = results.insertId;
                req.session.username = username;
                res.redirect('/top');
                }
            );
        });
    }
);

// app.get('/logintest', (req, res) => {
//     connection.query(
//         'SELECT * FROM users',
//         (error, results) => {
//             console.log(results [0]);
//         res.render('test.ejs');
//         }
//     );
// });


app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (error, results) => {
        if (results.length > 0) {
          const plain = req.body.password
          const hash = results[0].password
          bcrypt.compare(plain,hash,(error,isEqual) => {
            if(isEqual){
              req.session.userId = results[0].id;
              req.session.username = results[0].username;
              res.redirect('/top');
            }else{
              res.redirect('/login');
            }
          })
        } else {
          res.redirect('/login');
        }
      }
    );
  });


app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      res.redirect('/list');
    });
});

app.post('/create', (req, res) => {
    connection.query(
    'insert into post(title,text,area)values(?,?,?)',
    [[req.body.title],[req.body.text],[req.body.area]],
    (error, results) =>{
        connection.query(
          'SELECT * FROM post',
          (error, results) => {
            res.render('index.ejs', {post: results});
          }
        );
      }
    )
});

app.get('/detail/:id', (req, res) => {
    connection.query(
        'select * from post where id =?',
        [req.params.id],
        (error,results)=>{
          console.log(results);
        //   res.redirect("/new");
          res.render('/detail/:id', {post:results});
        }
    )
});

app.post('/delete/:id', (req, res) => {
    connection.query(
        'delete from post where id =?',
        [req.params.id],
        (error,results)=>{
          res.redirect('/index');
        }
    )
});

app.get('/edit/:id', (req, res) => {
    connection.query(
      'SELECT * FROM post WHERE id = ?',
      [req.params.id],
      (error, results) => {
        res.render('edit.ejs', {post: results[0]});
      }
    );
  });

app.post('/update/:id', (req, res) => {
    connection.query(
     'update post SET title= ?, text= ?, area= ? WHERE id = ?',
     [req.body.title,req.body.text,req.body.area, req.params.id],
     (error, results) => {
       res.redirect('/index');
    });
});

app.listen(3000);