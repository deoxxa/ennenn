ennenn
======

Parse and serialise NNTP commands and responses with streams!

Overview
--------

ennenn frees you from caring about protocol details and splitting messages with
NNTP applications. It provides a streaming parser and serialiser for creating
commands and responses.

Or at least it will. Right now it's a work in progress.

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install ennenn

Or via git:

> $ git clone git://github.com/deoxxa/ennenn.git node_modules/ennenn

Usage
-----

Also see [example-response.js](https://github.com/deoxxa/ennenn/blob/master/example-response.js)
and [example-request.js](https://github.com/deoxxa/ennenn/blob/master/example-request.js).

```javascript
#!/usr/bin/env node

// Processing responses

var ennenn = require("ennenn");

// The callback passed into the ResponseParser constructor is automatically
// attached to the "response" event.
var parser = new ennenn.ResponseParser(function on_response(response) {
  console.log("[Response started] " + response.status_code + ": " + response.status_text);

  response.on("data", function on_data(chunk) {
    console.log("[Response data] " + chunk.length);
  });

  response.on("end", function on_end() {
    console.log("[Response ended]");
  });
});
```

```javascript
#!/usr/bin/env node

// Processing requests

var ennenn = require("./index");

// Same deal here with on_request as for on_response on ResponseParser.
var parser = new ennenn.RequestParser(function on_request(request) {
  console.log("[Request] " + request.command + ": " + request.arguments.join(", "));
});
```

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([deoxxa](http://github.com/deoxxa))
* Twitter ([@deoxxa](http://twitter.com/deoxxa))
* ADN ([@deoxxa](https://alpha.app.net/deoxxa))
* Email ([deoxxa@fknsrs.biz](mailto:deoxxa@fknsrs.biz))
