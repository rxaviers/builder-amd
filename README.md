## Why builder-amd?

Use `builder-amd` to generate the JS bundle of an AMD modular project.

It's ideal for applications that builds bundles on the fly using [Node.js][].

[Node.js]: http://nodejs.org/

## Usage

   npm install builder-amd

```javascript
var fs = require( "js" );
var amdBuilder = require( "builder-amd" );

var files = {
  "main.js": fs.readFileSync( "./main.js" ),
  "foo.js": fs.readFileSync( "./foo.js" ),
  "bar.js": fs.readFileSync( "./foo.js" )
  ...
}

amdBuilder( files, {
  include: "main"
}, function( error, builtJs ) {
  ...
});
```

## API

- **`amdBuilder( files, requirejsConfig, callback )`**

**files** *Object* containing (path, data) key-value pairs, e.g.:

```
{
   <path-of-file-1>: <data-of-file-1>,
   <path-of-file-2>: <data-of-file-2>,
   ...
}
```

**requirejsConfig** *Object* [require.js build configuration][].

**callback** *Function* called with three arguments: null or an Error object, a
String with the built css content, an Object with the cloned built files
structure.

[require.js build configuration]: https://github.com/jrburke/r.js/blob/master/build/example.build.js

## Test

    npm test

## License

MIT © [Rafael Xavier de Souza](http://rafael.xavier.blog.br)
