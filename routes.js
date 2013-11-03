/* 
 * sevenj - routes.js
 * Copyright(c) 2013 jianchen <jianchen2580@gmail.com>
 * MIT Licensed
 */

var user = require('./controllers/user');
var site = require('./controllers/site');
var account = require('./controllers/account');

module.exports = function (app) {
    app.get('/', site.index);

    app.get('/signup', account.showSignup);
    app.post('/signup', account.signup);
    app.get('/signin', account.showSignin);
    app.post('/signin', account.signin);
    app.get('/signout', account.signout);
    app.get('/active_account', account.active_account);
};
