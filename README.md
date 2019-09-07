# mongo-migrate-maestroserver
#### NPM: mongodb-migrate-maestroserver

Forked framework from: https://github.com/afloyd/mongo-migrate, bumped mongodb version to >3.

- Now, only support connection string
- Can use mongo:// or mongodb+srv:// protocol

## Installation
	$ npm install mongodb-migrate-maestroserver

## Usage
```
Usage: node mongodb-migrate-maestroserver[options] [command]

Options:
	-runmm, --runMongoMigrate		Run the migration from the command line
	-c, --chdir <path>				Change the working directory (if you wish to store your migrations outside of this folder
	-dbc, --dbConfig            	Valid JSON string containing db settings (overrides -c, -cfg, & -dbn), like this:
										-dbc='{ "host": "localhost", "db": "mydbname", "port": 27017, "username": "myuser", "password": "mypwd"}'
	-cfg, --config <filename>		DB config file name
	-dbn, --dbPropName <string>	Property name for the database connection in the config file. The configuration file should contain something like
    {
        "connectionString": "mongodb+srv://user:password@mongo1.host.com:27018",
        "database": database,
    }

Commands:
	down [revision]		migrate down (stop at optional revision name/number)
	up [revision]		migrate up (stop at optional revision name/number)
	create [title]		create a new migration file with optional [title]
```

## Command-line usage
NPM will install `mongodb-migrate-maestroserver` into a `node_modules` folder within the directory it is run. To use `mongodb-migrate-maestroserver` from the command line, you must always specify the relative path from your current directory to the `mongodb-migrate-maestroserver` directory for `node` to be able to find it. Such as: `node ./node_modules/mongodb-migrate-maestroserver -runmm create` (shown in examples below), or on *nix machines `node ./node_modules/mongodb-migrate-maestroserver -runmm create`.

## Creating Migrations
To create a migration execute with `node ./node_modules/mongodb-migrate-maestroserver-runmm create` and optionally a title. mongodb-migrate-maestroserverwill create a node module within `./migrations/` which contains the following two exports:
```
var mongodb = require('mongodb');

exports.up = function (db, next) {
	next();
};

exports.down = function (db, next) {
	next();
};
```

All you have to do is populate these, invoking `next()` when complete, and you are ready to migrate! If you detect an error during the `exports.up` or `exports.down` pass next(err) and the migration will attempt to revert the opposite direction. If you're migrating up and error, it'll try to do that migration down.

For example:

```
	$ node ./node_modules/mongodb-migrate-maestroserver -runmm create add-pets
	$ node ./node_modules/mongodb-migrate-maestroserver -runmm create add-owners
```

The first call creates `./migrations/0005-add-pets.js`, which we can populate:
```
exports.up = function (db, next) {
	var pets = db.Collection('pets');
	pets.insertOne({name: 'tobi'}, next);
};

exports.down = function (db, next) {
	var pets = db.Collection('pets');
	pets.findOneAndDelete({name: 'tobi'}, next);
};
```

The second creates `./migrations/0010-add-owners.js`, which we can populate:
```
	exports.up = function(db, next){
		var owners = db.Collection('owners');
		owners.insertOne({name: 'taylor'}, next);
    };

	exports.down = function(db, next){
		var owners = db.Collection('owners');
		owners.findOneAndDelete({name: 'taylor'}, next);
	};
```

## Running Migrations
When first running the migrations, all will be executed in sequence.

```
	node ./node_modules/mongodb-migrate-maestroserver-runmm
	up : migrations/0005-add-pets.js
	up : migrations/0010-add-owners.js
	migration : complete
```

Subsequent attempts will simply output "complete", as they have already been executed on the given database. `mongodb-migrate` knows this because it stores migrations already run against the database in the `migrations` collection.
```
	$ node mongodb-migrate-maestroserver-runmm
	migration : complete
```

If we were to create another migration using `node ./node_modules/mongodb-migrate-maestroserver-runmm create coolest-owner`, and then execute migrations again, we would execute only those not previously executed:
```
	$ node ./node_modules/mongodb-migrate-maestroserver-runmm
	up : migrations/0015-coolest-owner
```

If we were to then migrate using `node ./node_modules/mongodb-migrate-maestroserver-runmm down 5`. This means to run from current revision, which in this case would be `0015-coolecst-owner`, down to revision number 5. Note that you can use either the revision number, or then full revision name `0005-add-pets`
```
	$ node ./node_modules/mongodb-migrate-maestroserver-runmm down 5
	down : migrations/0015-coolest-owner
	down : migrations/0010-add-owners
```

## Configuration
### JSON String
This option allows you to pass in the database configuration on the command line, eliminating the need to store settings in a config file. The argument should be wrapped in single quotes, and all keys and string values must be in double quotes. Using this option overrides any of the other config options described below. The "port", "username", and "password" properties are optional.
```
$ node ./node_modules/mongodb-migrate-maestroserver-runmm -dbc '{ "host":"localhost","db":"mydbname","port":27017,"username":"myuser","password":"mypwd"}' up
migration : complete
```
### Working Directory
The options for connecting to the database are read in from a file. You can configure where the file is read in from and where the migration directory root is by the `-c <path>` option.
```
	$ node ./node_modules/mongodb-migrate-maestroserver-runmm -c ../.. up
	migration : complete
```
This would set the working directory two levels above the mongodb-migrate-maestroserverdirectory, such as if you included it into another project and it was nested in the node_modules folder.

### Config filename
The default configuration filename is `default-config.json`. If you wish to use a different filename, use the `-cfg <filename>` option:
```
	$ node ./node_modules/mongodb-migrate-maestroserver-runmm -cfg my-config.json up
	migration : complete
```

### Config file property name
Inside the configuration file, mongodb-migrate-maestroserverexpects the database connection information to be nested inside an object. The default object name is `mongoAppDb`. If you wish to change this you can use the `-dbn <string>` option:
```
	$ node ./node_modules/mongodb-migrate-maestroserver-runmm -dbn dbSettings up
	migration : complete
```

Use `connectionString` property:
```
	{
		"mongoAppDb": {
			"connectionString": "mongodb+srv://user:password@mongo1.host.com:27018",
            "database": database,
		}
	}
```

Can set mongo client options.
```
"mongoAppDb": {
    "connectionString": "mongodb://user:password@mongo1.host.com:27018",
    "database": database,
    "strOpts":
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
}
```

All of these settings can be combined as desired, except for the up/down obviously ;)


# Licence

(The MIT License)

Copyright &copy; 2019 Felipe Signorini
Copyright &copy; 2017 Austin Floyd

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
