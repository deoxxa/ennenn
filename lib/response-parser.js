var STATE = {
  INITIAL: 1,
  STATUS_CODE_INITIAL: 2,
  STATUS_CODE_PARTWAY: 3,
  STATUS_TEXT: 4,
  CONTENT_INITIAL: 5,
  CONTENT_PARTWAY: 6,
  CONTENT_MAYBE_END: 7,
};

var Steez = require("steez"),
    util = require("util");

var Response = require("./response");

var ResponseParser = module.exports = function ResponseParser(on_response) {
  Steez.call(this);

  this.current_response = null;
  this.state = STATE.INITIAL;
  this.status_code = null;
  this.status_text = null;

  if (typeof on_response === "function") {
    this.on("response", on_response);
  }
};
util.inherits(ResponseParser, Steez);

ResponseParser.STATE = STATE;

ResponseParser.prototype.write = function write(data) {
  this.parse(data);

  return !this.paused && this.writable;
};

ResponseParser.prototype.parse = function parse(data) {
  var offset = 0;
  while (offset < data.length) {
//    console.log("Looping at offset " + offset + " of " + data.length + " bytes in state " + this.state);

    if (this.state === STATE.INITIAL) {
      this.state = STATE.STATUS_CODE_INITIAL;
      this.status_code = "";
      this.status_text = "";
    }

    if (this.state === STATE.STATUS_CODE_INITIAL) {
      if (data[offset] >= "0" && data[offset] <= "9") {
        this.state = STATE.STATUS_CODE_PARTWAY;
      } else {
        this.emit("error", new Error("expected ^[0-9], got `" + data[offset] + "'"));
        break;
      }
    }

    if (this.state === STATE.STATUS_CODE_PARTWAY) {
      if (data[offset] >= "0" && data[offset] <= "9") {
        var start = offset;

        while (data[offset] >= "0" && data[offset] <= "9" && offset < data.length) {
          offset++;
        }

        this.status_code += data.substr(start, offset - start);

        if (offset === data.length) {
          continue;
        }
      } else if (data[offset] === " " || data[offset] === "\t") {
        valid = true;

        while ((data[offset] === " " || data[offset] === "\t") && offset < data.length) {
          offset++;
        }

        if (offset === data.length) {
          continue;
        }
      } else {
        this.state = STATE.STATUS_TEXT;
        this.status_code = parseInt(this.status_code, 10);
      }
    }

    if (this.state === STATE.STATUS_TEXT) {
      var start = offset;

      while (data[offset] !== "\r" && data[offset] !== "\n" && offset < data.length) {
        offset++;
      }

      this.status_text += data.substr(start, offset - start);

      if (offset === data.length) {
        continue;
      }

      if (data[offset] === "\r") {
        offset++;
      }

      if (offset === data.length) {
        continue;
      }

      if (data[offset] === "\n") {
        this.state = Response.TYPE[this.status_code].has_content ? STATE.CONTENT_INITIAL : STATE.INITIAL;

        this.current_response = new Response(this.status_code, this.status_text, Response.TYPE[this.status_code].has_content, Response.TYPE[this.status_code].wants_more);

        this.emit("response", this.current_response);

        if (this.state === STATE.INITIAL) {
          this.current_response.emit("end");
          this.current_response = null;
        }

        offset++;
      }
    }

    if (this.state === STATE.CONTENT_INITIAL) {
      if (data[offset] === ".") {
        this.state = STATE.CONTENT_MAYBE_END;
        offset++;

        if (offset === data.length) {
          continue;
        }
      } else {
        this.state = STATE.CONTENT_PARTWAY;
      }
    }

    if (this.state === STATE.CONTENT_MAYBE_END) {
      if (data[offset] === ".") {
        this.state = STATE.CONTENT_PARTWAY;
      } else if (data[offset] === "\r") {
        offset++;

        if (offset === data.length) {
          continue;
        }
      } else if (data[offset] === "\n") {
        this.state = STATE.INITIAL;

        this.current_response.emit("end");
        this.current_response = null;

        offset++;

        if (offset === data.length) {
          continue;
        }
      }
    }

    if (this.state === STATE.CONTENT_PARTWAY) {
      var start = offset;

      while (data[offset] !== "\n" && offset < data.length) {
        offset++;
      }

      if (data[offset] === "\n") {
        this.state = STATE.CONTENT_INITIAL;
      }

      this.current_response.write(data.substr(start, offset - start));

      offset++;

      continue;

      if (offset === data.length) {
        continue;
      }
    }
  }
};
