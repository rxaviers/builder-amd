var files,
	async = require( "async" ),
	expect = require( "chai" ).expect,
	fs = require( "fs" ),
	amdBuilder = require( "../index.js" );

files = {
	"foo.js": fs.readFileSync( __dirname + "/fixtures/basic/foo.js" ),
	"bar.js": fs.readFileSync( __dirname + "/fixtures/basic/bar.js" )
};

describe( "The JS file of the include property", function() {
	var js;

	before(function( done ) {
		amdBuilder( files, { include: [ "bar" ] }, function( error, _js ) {
			js = _js;
			done( error );
		});
	});

	it( "must be included", function() {
		expect( js ).to.equal( "define(\"bar\",[],function(){}),define(\"output\",function(){});" );
	});

});

describe( "The JS dependencies", function() {
	var js;

	before(function( done ) {
		amdBuilder( files, { include: [ "foo" ] }, function( error, _js ) {
			js = _js;
			done( error );
		});
	});

	it( "must be included", function() {
		expect( js ).to.equal( "define(\"bar\",[],function(){}),define([\"./bar\"]),define(\"output\",function(){});" );
	});

});

describe( "Using appDir", function() {
	var js, files;

	files = {
		"fixtures/foo.js": fs.readFileSync( __dirname + "/fixtures/basic/foo.js" ),
		"fixtures/bar.js": fs.readFileSync( __dirname + "/fixtures/basic/bar.js" )
	};

	before(function( done ) {
		amdBuilder( files, { appDir: "fixtures", include: [ "foo" ] }, function( error, _js ) {
			js = _js;
			done( error );
		});
	});

	it( "should work just fine", function() {
		expect( js ).to.equal( "define(\"bar\",[],function(){}),define([\"./bar\"]),define(\"output\",function(){});" );
	});

});

describe( "Serial runs", function() {
	var barJs, fooJs;

	before(function( done ) {
		async.series([
			function( callback ) {
				amdBuilder( files, { include: [ "bar" ] }, callback );
			},
			function( callback ) {
				amdBuilder( files, { include: [ "foo" ] }, callback );
			}
		], function( error, result ) {
			if ( error ) {
				return done( error );
			}
			barJs = result[ 0 ][ 0 ];
			fooJs = result[ 1 ][ 0 ];
			done();
		});
	});

	it( "should work just fine", function() {
		expect( barJs ).to.equal( "define(\"bar\",[],function(){}),define(\"output\",function(){});" );
		expect( fooJs ).to.equal( "define(\"bar\",[],function(){}),define([\"./bar\"]),define(\"output\",function(){});" );
	});

});

describe( "Concurrent runs", function() {
	var barJs, fooJs;

	before(function( done ) {
		async.parallel([
			function( callback ) {
				amdBuilder( files, { include: [ "bar" ] }, callback );
			},
			function( callback ) {
				amdBuilder( files, { include: [ "foo" ] }, callback );
			}
		], function( error, result ) {
			if ( error ) {
				return done( error );
			}
			barJs = result[ 0 ][ 0 ];
			fooJs = result[ 1 ][ 0 ];
			done();
		});
	});

	it( "should work just fine", function() {
		expect( barJs ).to.equal( "define(\"bar\",[],function(){}),define(\"output\",function(){});" );
		expect( fooJs ).to.equal( "define(\"bar\",[],function(){}),define([\"./bar\"]),define(\"output\",function(){});" );
	});

});

describe( "onBuildWrite property", function() {
	var js;

	before(function( done ) {
		amdBuilder( files, {
			include: [ "foo" ],
			optimize: "none",
			onBuildWrite: function( id, path, contents ) {
				return "/* banner for " + id + " */\n" + contents;
			}
		}, function( error, result ) {
			if ( error ) {
				return done( error );
			}
			js = result;
			done();
		});
	});

	it( "should work just fine", function() {
		expect( js ).to.equal( "/* banner for bar */\ndefine('bar',[],function() {});\n\n/* banner for foo */\ndefine([ \"./bar\" ]);\n\n\ndefine(\"output\", function(){});\n" );
	});
});

