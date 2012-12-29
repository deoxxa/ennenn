#!/usr/bin/env node

var ennenn = require("./index");

var parser = new ennenn.RequestParser(function on_request(request) {
  console.log("[Request] " + request.command + ": " + request.arguments.join(", "));
});

parser.write("GET a b c\r\n");
