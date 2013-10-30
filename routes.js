/* 
 * sevenj - routes.js
 * Copyright(c) 2013 jianchen <jianchen2580@gmail.com>
 * MIT Licensed
 */

var user = require('./controllers/user');
var site = require('./controllers/site');

module.exports = function (app) {
    app.get('/', site.index);
};
