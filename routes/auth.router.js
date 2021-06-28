const express = require('express');
const authRouter = express.Router();
const User = require('./../models/User.model');

const bcrypt = require('bcrypt');
const saltRounds = 10;

authRouter.get('/signup', (req, res, next) => {
    res.render('auth/signup');
});

authRouter.post('/signup', (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        res.render('auth/signup', { errorMessage: "Please fill in all fields in order to register."});
        return;
    }

    bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
            return User.create({ fullName, email, password: hashedPassword });
        })
        .then((createdUser) => {
            console.log(createdUser);
            req.session.currentUser = createdUser;
            res.redirect('/auth/profile');
        })
        .catch((err) => next(err));
});

authRouter.get('/login', (req, res, next) => {
    res.render('auth/login');
})

authRouter.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.render('auth/login', { errorMessage: "Please fill in all required fields"});
        return;
    }

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.render('auth/login', { errorMessage: 'Email is not registered. Try with other email.'});
            }
            else if (bcrypt.compareSync(password, user.password)) {
                req.session.currentUser = user;
                res.redirect('/auth/profile');
            }
            else {
                res.render('auth/login', { errorMessage: 'Incorrect password'});
            }
        })
        .catch((err) => next(err));
})

authRouter.post('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
})

authRouter.get('/profile', (req, res, next) => {
    const { currentUser } = req.session;
    res.render('auth/profile', { currentUser });
})

module.exports = authRouter