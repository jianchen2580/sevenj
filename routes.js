/* 
 * sevenj - routes.js
 * Copyright(c) 2013 jianchen <jianchen2580@gmail.com>
 * MIT Licensed
 */

var user = require('./controllers/user') ;
var account = require('./controllers/account');
var message = require('./controllers/message');
var topic = require('./controllers/topic');
var tag = require('./controllers/tag');

module.exports = function (app) {
    app.get('/', topic.home);

    app.get('/signup', account.showSignup);
    app.post('/signup', account.signup);
    app.get('/signin', account.showSignin);
    app.post('/signin', account.signin);
    app.get('/signout', account.signout);
    app.get('/active_account', account.active_account);

    //messages
    app.get('/messages', message.index);

    //app.get('/topic/create', auth.signinRequired, topic.create);
    app.get('/topic/create', topic.showCreate);
    app.post('/topic/create', topic.create);
    app.get('/topic/:tid', topic.index);
    app.get('/topic/:tid/edit', topic.showEdit);
    app.post('/topic/:tid/edit', topic.update);
    app.get('/topic/:tid/edit', topic.showEdit);

    // tag part
    app.get('/tag/create', tag.showCreate);
    app.post('/tag/create', tag.create);
    app.get('/tags', tag.listTags);
    app.get('/tag/:urlname', tag.index);
    app.get('/tag/:name/edit', tag.listTopics);
    app.get('/tag/:name/delete', tag.edit);
};
