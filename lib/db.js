module.exports = {
	getConnection: getConnection
};

function getMigrationsCollection(db, mongodb) {
	return db.collection('migrations');
}

function getConnection(opts, cb) {
	var mongodb = require('mongodb');

    var MongoClient = mongodb.MongoClient;
    var strOpts = opts.strOpts || {}
    MongoClient.connect(opts.connectionString, strOpts, function(err, client) {
        if (err) {
            return cb(err);
        }

        console.log("Connected correctly to server");
        var db = client.db(opts.database)

        cb(null, {
            connection: db,
            migrationCollection: getMigrationsCollection(db, mongodb)
        });
    });
    return;
}
