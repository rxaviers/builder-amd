var requirejs = require( "requirejs-memfiles" ),
	util = require( "util" );

function buildJs( files, config, callback ) {
	var include;

	if ( typeof config !== "object" ) {
		return callback( new Error( "missing or invalid config (object expected)" ) );
	}
	if ( !Array.isArray( config.include ) ) {
		return callback( new Error( "missing or invalid config.include (array expected)" ) );
	}

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

	requirejs.setFiles( files, function( done ) {
		requirejs.optimize( config, function() {
			callback( null, files[ "dist/output.js" ], files );
			done();
		}, function( error ) {
			callback( error );
			done();
		});
	});
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

	buildJs( clonedFiles, config, callback );
};
