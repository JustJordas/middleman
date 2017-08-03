var express = require('express');
var authRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');

var database = require('../controllers/database')();

var router = function () {
    authRouter.route('/signUp')
        .get(function (req, res) {
            res.render('signUp');
        })
        .post(function (req, res) {
            var user = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                type: 'client'
            }

            database.saveUser(user, function (response) {
                if (response === true) {
                    req.login(req.body, function () {
                        res.redirect('/auth/profile')
                    });
                } else {
                    res.redirect('/auth/signUp');
                }
            });
        });

    authRouter.route('/signUpHandler')
        .post(function (req, res) {
            var user = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                type: 'handler'
            }

            database.saveUser(user, function (response) {
                if (response === true) {
                    res.redirect('/auth/profileAdmin');
                } else {
                    res.redirect('/auth/profileAdmin');
                }
            });
        });

    authRouter.route('/logIn')
        .post(passport.authenticate('local', {
            failureRedirect: '/'
        }), function (req, res) {
            if (req.user.type === 'client') {
                res.redirect('profile');
            } else if (req.user.type === 'handler') {
                res.redirect('profileHandler');
            } else if (req.user.type === 'admin') {
                res.redirect('profileAdmin');
            }
        });

    authRouter.route('/logProblem')
        .all(function (req, res, next) {
            if (!(req.user && req.user.type === 'client')) {
                res.redirect('/');
            }
            next();
        })
        .get(function (req, res) {
            res.render('logProblem');
        })
        .post(function (req, res) {
            database.getHandlers(function (resultsHandlers) {
                database.getProblems({}, function (resultsProblems) {
                    var problem = {
                        client: req.user.email,
                        summary: req.body.summary,
                        description: req.body.description,
                        adress: {
                            adressLine1: req.body.adressLine1,
                            adressLine2: req.body.adressLine2,
                            city: req.body.city,
                            state: req.body.state,
                            zip: req.body.zip,
                            country: req.body.country
                        },
                        phone: req.body.phone,
                        handler: resultsHandlers[resultsProblems.length % resultsHandlers.length].email,
                        status: 'pending'
                    }

                    database.saveProblem(problem);
                });
            });
            res.redirect('/auth/profile');
        });

    authRouter.route('/profileHandler')
        .all(function (req, res, next) {
            if (!(req.user && req.user.type === 'handler')) {
                res.redirect('/');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            database.getProblems({
                handler: req.user.email
            }, function (results) {
                console.log(results.length);
                res.render('profileHandler', {
                    results: results
                });
            });
        })
        .post(function (req, res) {
            //how to update this one
            console.log(req.body);
            req.body.status = 'onGoing';
            database.updateProblem(req.body.id, req.body);
            database.getProblems({
                handler: req.user.email
            }, function (results) {
                res.render('profileHandler', {
                    results: results
                });
            });
        });

    authRouter.route('/profileAdmin')
        .all(function (req, res, next) {
            if (!(req.user && req.user.type === 'admin')) {
                res.redirect('/');
            }
            next();
        })
        .get(function (req, res) {
            database.getHandlers(function (results) {
                console.log(results);

                res.render('profileAdmin', {
                    results: results
                });
            });
        });

    return authRouter;
};

module.exports = router;
