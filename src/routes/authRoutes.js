var express = require('express');
var authRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');

var database = require('../controllers/database')();

var router = function () {
    authRouter.route('/signUp')
        .get(function (req, res) {
            res.render('signUp2');
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
                        res.redirect('/auth/profile2')
                    });
                } else {
                    res.redirect('/auth/signUp2', {
                        fail: true
                    });
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
                res.redirect('profile2');
            } else if (req.user.type === 'handler') {
                res.redirect('profileHandler2');
            } else if (req.user.type === 'fixer') {
                res.redirect('profileFixer2');
            } else if (req.user.type === 'admin') {
                res.redirect('profileAdmin');
            }
        });

    authRouter.route('/logOut')
        .post(function (req, res) {
            req.logout();
            res.redirect('/');
        });

    authRouter.route('/logProblem')
        .all(function (req, res, next) {
            if (!(req.user && req.user.type === 'client')) {
                res.redirect('/');
            }
            next();
        })
        .post(function (req, res) {
            database.getHandlers(function (resultsHandlers) {
                database.getProblems({}, function (resultsProblems) {
                    var problem = {
                        client: req.user.email,
                        summary: req.body.summary,
                        description: req.body.description,
                        address: {
                            adressLine1: req.body.addressLine1,
                            adressLine2: req.body.addressLine2,
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
                    res.redirect('profile2');
                });
            });
        });

    authRouter.route('/profile2')
        .all(function (req, res, next) {
            if (!(req.user && req.user.type === 'client')) {
                res.redirect('/');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            database.getProblems({
                client: req.user.email
            }, function (results) {
                //console.log(results);
                res.render('profile2', {
                    results: results
                });
            });
        });

    authRouter.route('/profileHandler2')
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
                //console.log(results.length);
                res.render('profileHandler2', {
                    results: results
                });
            });
        })
        .post(function (req, res) {
            //how to update this one
            //console.log(req.body);
            req.body.status = 'onGoing';
            database.updateProblem(req.body.id, req.body);
            database.getProblems({
                handler: req.user.email
            }, function (results) {
                res.redirect('profileHandler2');
            });
        });

    authRouter.route('/profileFixer2')
        .all(function (req, res, next) {
            if (!(req.user && req.user.type === 'fixer')) {
                res.redirect('/');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            database.getProblems({
                fixer: req.user.email
            }, function (results) {
                //console.log(results);
                res.render('profileFixer2', {
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
                //console.log(results);

                res.render('profileAdmin', {
                    results: results
                });
            });
        });

    return authRouter;
};

module.exports = router;
