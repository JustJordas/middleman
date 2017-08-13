var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var url = 'mongodb://test:pass@ds129183.mlab.com:29183/middleman';

var database = function () {
    var saveUser = function (user, callback) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('users');

            collection.findOne({
                    email: user.email
                },
                function (err, results) {
                    if (!results) {
                        collection.insert(user);

                        return callback(true);
                    } else {
                        return callback(false);
                    }
                });
        });
    };

    var saveProblem = function (problem) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('problems');

            collection.insert(problem);
        });
    };

    var checkCredentials = function (email, password, done) {
        //check database

        mongodb.connect(url, function (err, db) {
            var collection = db.collection('users');
            collection.findOne({
                    email: email
                },
                function (err, results) {
                    if (results) {
                        if (results.password === password) {
                            var user = results;
                            done(null, user);
                        } else {
                            done(null, false);
                        }
                    } else {
                        done(null, false);
                    }
                }
            );
        });
    }

    var getProblems = function (filter, callback) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('problems');
            
            collection.find(filter).toArray(function (err, result) {
                return callback(result);
            });
        });
    };

    var updateProblem = function (id, update) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('problems');
            
            collection.updateOne({
                _id: objectId(id)
            }, {
                '$set': update
            });
        });
    };

    var getHandlers = function (callback) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('users');

            collection.find({
                type: 'handler'
            }).toArray(function (err, result) {
                return callback(result);
            });
        });
    };
    
    var saveUpdate = function (update) {
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('updates');
            
            collection.insert(update);
        });
    };
    
    var getUpdates = function (filter, callback) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('updates');

            collection.find(filter).toArray(function (err, result) {
                return callback(result);
            });
        });
    };

    return {
        saveUser: saveUser,
        saveProblem: saveProblem,
        checkCredentials: checkCredentials,
        getProblems: getProblems,
        updateProblem: updateProblem,
        getHandlers: getHandlers,
        saveUpdate: saveUpdate,
        getUpdates: getUpdates
    }
}

module.exports = database;
