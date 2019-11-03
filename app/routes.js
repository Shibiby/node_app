var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection); 
var bcrypt = require('bcrypt-nodejs');



module.exports = function(app, passport) {

    
    app.get('/',isLoggedIn,function(req,res){
        var row = [];
        var row2=[];
        connection.query('select * from users where id = ?',[req.user.id], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                        
                    }  
                }
                console.log(row);
                
            }

            res.render('index.ejs', {rows : row}); // user.ejs ye gönderiyoruz . 
        });
    });

    app.get('/login', function(req, res) {

        res.render('login.ejs',{ message: req.flash('loginMessage') });

    });

    app.get('/signup', function(req, res){
        res.render('signup.ejs',{message: req.flash('message')});
      });

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/login',
            failureRedirect: '/signup',
            failureFlash : true 
    }));

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', 
            failureRedirect : '/login',
            failureFlash : true 
        }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    //show customers
    app.get('/view_customer', function(req, res){
        connection.query('SELECT * FROM customers', function(err, rs){
            res.render('view_customer', { customers: rs});
        });
    });

    //add customers
    app.get('/add_customer', function(req, res, next){
        res.render('add_customer', { 
            message: req.flash('Customer Successfully Added'),
            customer: {} });
    });

    app.post('/add_customer', function(req, res, next) {
        connection.query('INSERT INTO customers SET ?', req.body, function(err, rs) {
            res.redirect('/add_customer');
        });
    });

    //delete customers
    app.get('/delete_customer', function(req, res, next){
        connection.query('DELETE FROM customers WHERE id = ?', req.query.id, function(err, rs){
            res.redirect('/view_customer');
        });
    });

    //edit customers
    app.get('/edit_customer', function(req, res, next){
        connection.query('SELECT * FROM customers WHERE id = ?', req.query.id, function(err, rs){
            res.render('add_customer', {
                customer: rs[0] });
        });
    });

    app.post('/edit_customer', function(req, res, next){
        var param = [
            req.body,
            req.query.id
        ]
        connection.query('UPDATE customers SET ? WHERE id = ?', param, function(err, rs){
            res.redirect('view_customer');
        });
    });

    //edit user
    app.get('/profile', function(req, res, next){
        connection.query('SELECT * FROM users WHERE id = ?', req.query.id, function(err, rs){
            res.render('profile', {
                user: rs[0]
            });
        });
    });

    app.post('profile')


};

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/login');
}

