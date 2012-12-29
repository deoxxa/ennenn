var STATE = {
  INITIAL: 1,
  COMMAND_INITIAL: 2,
  COMMAND_PARTWAY: 3,
  ARGUMENT_INITIAL: 4,
  ARGUMENT_PARTWAY: 5,
  TERMINATOR: 6,
};

var Steez = require("steez"),
    util = require("util");

var Parser = module.exports = function Parser(on_request) {
  Steez.call(this);

  this.state = STATE.INITIAL;
  this.command = null;
  this.arguments = null;
  this.bytes = null;

  if (typeof on_request === "function") {
    this.on("request", on_request);
  }
};
util.inherits(Parser, Steez);

Parser.STATE = STATE;

Parser.prototype.write = function write(data) {
  var offset = 0;
  while (offset < data.length) {
    console.log("looping in state " + this.state);

    if (this.state === STATE.INITIAL) {
      this.state = STATE.COMMAND_INITIAL;
    }

    if (this.state === STATE.COMMAND_INITIAL) {
      if (data[offset] === " " || data[offset] === "\t" || data[offset] === "\r" || data[offset] === "\n") {
        this.emit("error", new Error("got invalid whitespace at start of command"));
        break;
      }

      this.command = "";
      this.arguments = [];
      this.state = STATE.COMMAND_PARTWAY;
    }

    if (this.state === STATE.COMMAND_PARTWAY) {
      var start = offset;

      while (data[offset] !== " " && data[offset] !== "\t" && data[offset] !== "\r" && data[offset] !== "\n" && offset < data.length) {
        offset++;
      }

      if (offset !== start) {
        this.command += data.substr(start, offset - start);
      }

      if (offset === data.length) {
        continue;
      }

      if (data[offset] === " " || data[offset] === "\t") {
        this.state = STATE.ARGUMENT_INITIAL;
        continue;
      }

      if (data[offset] === "\r") {
        offset++;
        this.state = STATE.TERMINATOR;

        if (offset === data.length) {
          continue;
        }
      }
    }

    if (this.state === STATE.ARGUMENT_INITIAL) {
      while ((data[offset] === " " || data[offset] === "\t") && offset < data.length) {
        offset++;
      }

      if (offset === data.length) {
        continue;
      }

      if (data[offset] === "\r") {
        offset++;

        this.state = STATE.TERMINATOR;

        if (offset === data.length) {
          continue;
        }
      } else {
        this.state = STATE.ARGUMENT_PARTWAY;
        this.arguments.push("");

        continue;
      }
    }

    if (this.state === STATE.ARGUMENT_PARTWAY) {
      var start = offset;

      while (data[offset] !== " " && data[offset] !== "\t" && data[offset] !== "\r" && data[offset] !== "\n" && offset < data.length) {
        offset++;
      }

      if (offset !== start) {
        this.arguments[this.arguments.length-1] += data.substr(start, offset - start);
      }

      if (offset === data.length) {
        continue;
      }

      if (data[offset] === " " || data[offset] === "\t") {
        this.state = STATE.ARGUMENT_INITIAL;
        continue;
      }

      if (data[offset] === "\r") {
        offset++;
        this.state = STATE.TERMINATOR;

        if (offset === data.length) {
          continue;
        }
      }
    }

    if (this.state === STATE.TERMINATOR) {
      if (data[offset] !== "\n") {
        this.emit("error", new Error("expected \\n, got " + data[offset]));
        break;
      }

      if (data[offset] === "\n") {
        this.emit("request", {command: this.command, arguments: this.arguments});

        this.command = null;
        this.arguments = null;
        this.state = STATE.INITIAL;

        offset++;

        if (offset === data.length) {
          continue;
        }
      }
    }
  }

  return !this.paused && this.writable;
};
