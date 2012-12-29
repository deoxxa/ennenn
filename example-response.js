#!/usr/bin/env node

var ennenn = require("./index");

var parser = new ennenn.ResponseParser(function on_response(response) {
  console.log("[Response started] " + response.status_code + ": " + response.status_text);

  response.on("data", function on_data(chunk) {
    console.log("[Response data] " + chunk.length);
  });

  response.on("end", function on_end() {
    console.log("[Response ended]");
  });
});

parser.write("200 this is alright!\r\n200 and");
parser.write(" so is this");
parser.write("\r\n");
parser.write("220 ok some data is coming\r\n");
parser.write("this is some data\r\n");
parser.write("so this this...");
parser.write("\r");
parser.write("\n");
parser.write(".\r\n");
parser.write("2");
parser.write("01 lol\r\n");
parser.write("220 more data\r\n.. << should be one period\r\n.\r\n");
