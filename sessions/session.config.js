const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

module.exports = app => {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000
        },
        store: MongoStore.create(
                { mongoUrl: process.env.MONGODB_URI,
                  ttl: 60 * 60 * 24
                }
            )
    }));
};