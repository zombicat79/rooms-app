const express = require('express');
const roomRouter = express.Router();

const Room = require('./../models/Room.model');
const User = require('./../models/User.model');
const Review = require('./../models/Review.model');

roomRouter.get('/', (req, res, next) => {
    const { currentUser } = req.session;
    
    Room.find()
        .populate('owner')
        .populate('reviews')
        .populate({
            path: 'reviews',
            populate: { path: 'user' }
        })
        .then((allRooms) => {
            res.render('rooms/room-list', { allRooms, reviews: allRooms.reviews });
        })
        .catch((err) => next(err));
});

roomRouter.get('/create', (req, res, next) => {
    const { currentUser } = req.session;
    
    if (currentUser) {
        res.render('rooms/create-room', { currentUser });
    }
    else {
        res.render('rooms/create-room', { errorMessage: 'You must be logged in to create a room!' }); 
    }
});

roomRouter.post('/create', (req, res, next) => {
    const { name, description, imageUrl } = req.body;
    const { currentUser } = req.session;

    Room.create({ name, description, imageUrl, owner: currentUser._id })
        .then((newRoom) => {
            console.log(newRoom);
            res.redirect('/rooms');
        })
        .catch((err) => next(err));
});

roomRouter.get('/:roomId/edit', (req, res, next) => {
    const { roomId } = req.params;
    const { currentUser } = req.session;

    Room.findById(roomId)
        .then((room) => {
            if (room.owner == currentUser._id) {
                res.render('rooms/edit-room', { room });
            }
            else {
                res.render('rooms/edit-room', { errorMessage: "You are not allowed to edit this room."})
            }
        })
        .catch((err) => next(err));
})

roomRouter.post('/:roomId/edit', (req, res, next) => {
    const { roomId } = req.params;
    const { name, description, imageUrl } = req.body;

    Room.findByIdAndUpdate(roomId, { name, description, imageUrl })
        .then((updatedRoom) => res.redirect('/'))
        .catch((err) => next(err));
});

roomRouter.get('/:roomId/addReview', (req, res, next) => {
    const { roomId } = req.params;
    const { currentUser } = req.session;

    Room.findById(roomId)
        .populate('owner')
        .then((room) => {
            if (!currentUser) {
                res.render('auth/login', { errorMessage: "You need to be logged in to add a review. Please log in." });
            }
            else {
                if (room.owner._id == currentUser._id) {
                    res.render('rooms/room-list', { errorMessage: "You cannot add reviews to your own rooms!" });   
                }
                else {
                    res.render('rooms/add-review', { id: roomId, currentUser }); 
                } 
            }
        })
        .catch((err) => next(err));
});

roomRouter.post('/:roomId/addReview', (req, res, next) => {
    const { roomId } = req.params;
    const { user, comment } = req.body;

    User.find({ fullName: user })
        .then((identifiedUser) => {
            const newReview = Review.create({ user: identifiedUser[0]._id, comment });
            return newReview;
        })
        .then((newReview) => {
            return Room.findByIdAndUpdate(roomId, { $push: { reviews: newReview._id }});
        })
        .then(() => res.redirect("/rooms"))
        .catch((err) => console.log(err));
});

roomRouter.post('/:roomId/delete', (req, res, next) => {
    const { roomId } = req.params;
    const { currentUser } = req.session;
    
    Room.findById(roomId)
        .then((room) => {
            if (room.owner == currentUser._id) {
                Room.findByIdAndDelete(roomId)
                .then(() => res.render('rooms/room-list', { deleteMessage: "Room successfully deleted."}));
            }
            else {
                res.render('rooms/room-list', { errorMessage: "You are not allowed to delete this room."})
            }
        })
        .catch((err) => console.log(err));
});

module.exports = roomRouter;