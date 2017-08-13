var express = require('express');
var problemRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var passport = require('passport');

var database = require('../controllers/database')();

var router = function () {
    problemRouter.route('/:id')
        .all(function (req, res, next) {
            if (req.params.id.length === 24) {
                database.getProblems({
                    _id: objectId(req.params.id)
                }, function (results) {
                    var flag = true;
                    if (results.length === 1) {
                        var emailClient = results[0].client;
                        var emailHandler = results[0].handler;
                        var emailFixer = results[0].fixer;

                        if (typeof (req.user) !== 'undefined') {
                            flag = req.user.email === emailClient || req.user.email === emailHandler || req.user.email === emailFixer;
                        } else {
                            flag = false;
                        }
                    } else {
                        flag = false;
                    }

                    if (flag === false) {
                        res.redirect('/');
                    } else {
                        next();
                    }
                });
            } else {
                res.redirect('/');
            }
        })
        .get(function (req, res) {
            //console.log(req.params.id);
            database.getProblems({
                _id: objectId(req.params.id)
            }, function (results) {
                //console.log(results[0]);
                var flag = true;
                if (results.length === 1) {
                    var emailClient = results[0].client;
                    var emailHandler = results[0].handler;
                    var emailFixer = results[0].fixer;

                    flag = req.user && (req.user.email === emailClient || req.user.email === emailHandler || req.user.email === emailFixer);

                    if (flag === true) {
                        database.getUpdates({
                            problemID: results[0].id
                        }, function (updates) {
                            results[0].updates = updates;
                            results[0].user = req.user;

                            //console.log(updates);

                            res.render('problemDetails', {
                                result: results[0]
                            });
                        });
                    }
                }
            });
        })
        .post(function (req, res) {
            Number.prototype.padLeft = function (base, chr) {
                var len = (String(base || 10).length - String(this).length) + 1;
                return len > 0 ? new Array(len).join(chr || '0') + this : this;
            }

            var d = new Date,
                dformat = [(d.getMonth() + 1).padLeft(),
               d.getDate().padLeft(),
               d.getFullYear()].join('/') + ' ' + [d.getHours().padLeft(),
               d.getMinutes().padLeft(),
               d.getSeconds().padLeft()].join(':');
            var update = {
                problemID: req.params.id,
                timestamp: dformat,
                author: req.user.email,
                update: req.body.update
            }

            database.saveUpdate(update);
            res.redirect('' + req.params.id);
        });

    problemRouter.route('/complete/:id')
        .all(function (req, res, next) {
            if (req.params.id.length === 24) {
                database.getProblems({
                    _id: objectId(req.params.id)
                }, function (results) {
                    var flag = true;
                    if (results.length === 1) {
                        var emailClient = results[0].client;
                        var emailHandler = results[0].handler;

                        if (typeof (req.user) !== 'undefined') {
                            flag = req.user.email === emailClient || req.user.email === emailHandler;
                        } else {
                            flag = false;
                        }
                    } else {
                        flag = false;
                    }

                    if (flag === false) {
                        res.redirect('/');
                    } else {
                        next();
                    }
                });
            } else {
                res.redirect('/');
            }
        })
        .post(function (req, res) {
            database.getProblems({
                _id: objectId(req.params.id)
            }, function (results) {
                //console.log(results);
                results[0].status = 'completed'
                database.updateProblem(req.params.id, results[0]);

                res.redirect('/auth/profileHandler2');
            });
        });

    problemRouter.route('/rating/:id')
        .all(function (req, res, next) {
            if (req.params.id.length === 24) {
                database.getProblems({
                    _id: objectId(req.params.id)
                }, function (results) {
                    var flag = true;
                    if (results.length === 1) {
                        var emailClient = results[0].client;

                        if (typeof (req.user) !== 'undefined') {
                            flag = req.user.email === emailClient;
                        } else {
                            flag = false;
                        }
                    } else {
                        flag = false;
                    }

                    if (flag === false) {
                        res.redirect('/');
                    } else {
                        next();
                    }
                });
            } else {
                res.redirect('/');
            }
        })
        .post(function (req, res) {
            database.getProblems({
                _id: objectId(req.params.id)
            }, function (results) {
                results[0].rating = req.body.rating;
                database.updateProblem(req.params.id, results[0]);

                res.redirect('/auth/profile2');
            });
        });

    return problemRouter;
};

module.exports = router;
