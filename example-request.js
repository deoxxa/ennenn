#!/usr/bin/env node

var ennenn = require("./index");

var parser = new ennenn.RequestParser(function on_request(request) {
  console.log("[Request started] " + request.command + ": " + request.arguments.join(", "));

/*
  request.on("data", function on_data(chunk) {
    console.log("[Request data] " + chunk.length);
  });

  request.on("end", function on_end() {
    console.log("[Request ended]");
  });
*/
});

parser.write("GET a b c\r\n");
