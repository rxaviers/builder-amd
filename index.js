var mutex, queue,
	requirejs = require( "requirejs-memfiles" ),
	util = require( "util" );

queue = [];

function enqueueBuildJs() {
	queue.push( arguments );
	if ( queue.length === 1 ) {
		dequeueBuildJs();
	}
}

function dequeueBuildJs() {
	var callback;
	var args = queue[ 0 ];
	if ( args !== undefined ) {
		callback = args[ 2 ];
		args[ 2 ] = function() {
			callback.apply( {}, arguments );
			queue.shift();
			dequeueBuildJs();
		};
		buildJs.apply( {}, args );
	}
}

function buildJs( files, config, callback ) {
	var localCallback, include;

	if ( mutex ) {
		return callback( new Error( "Concurrent calls not supported" ) );
	}
	if ( typeof config !== "object" ) {
		return callback( new Error( "missing or invalid config (object expected)" ) );
	}
	if ( !Array.isArray( config.include ) ) {
		return callback( new Error( "missing or invalid config.include (array expected)" ) );
	}
	mutex = true;
	localCallback = function( error, css ) {
		mutex = false;
		callback( error, css, files );
	};

	include = config.include;
	delete config.include;

	config = util._extend( {}, config );
	config.appDir = config.appDir || ".";
	config.baseUrl = config.baseUrl || ".";
	config = util._extend( config, {
		dir: "dist",
		modules: [{
			name: "output",
			include: include,
			create: true
		}]
	});

	requirejs.setFiles( files );
	requirejs.optimize( config, function() {
		localCallback( null, files[ "dist/output.js" ] );
	}, localCallback );
}

/**
 * amdBuilder( files, config, callback )
 */
module.exports = function( files, config, callback ) {
	var clonedFiles = {};

	// Clone files
	Object.keys( files ).forEach(function( path ) {
		clonedFiles[ path ] = files[ path ];
	});

	enqueueBuildJs( clonedFiles, config, callback );
};
