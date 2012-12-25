var STATE = {
  INITIAL: 1,
  STATUS_CODE_INITIAL: 2,
  STATUS_CODE_PARTWAY: 3,
  STATUS_TEXT: 4,
  CONTENT_INITIAL: 5,
  CONTENT_PARTWAY: 6,
  CONTENT_MAYBE_END: 7,
};

var RESPONSE = {
  "100": {has_content: true,  wants_more: false, description: "help text follows"},
  "199": {has_content: true,  wants_more: false, description: "debug output"},
  "200": {has_content: false, wants_more: false, description: "server ready - posting allowed"},
  "201": {has_content: false, wants_more: false, description: "server ready - no posting allowed"},
  "202": {has_content: false, wants_more: false, description: "slave status noted"},
  "205": {has_content: false, wants_more: false, description: "closing connection - goodbye!"},
  "211": {has_content: false, wants_more: false, description: "n f l s group selected"},
  "215": {has_content: true,  wants_more: false, description: "list of newsgroups follows"},
  "220": {has_content: true,  wants_more: false, description: "n <a> article retrieved - head and body follow"},
  "221": {has_content: true,  wants_more: false, description: "n <a> article retrieved - head follows"},
  "222": {has_content: true,  wants_more: false, description: "n <a> article retrieved - body follows"},
  "223": {has_content: false, wants_more: false, description: "n <a> article retrieved - request text separately"},
  "230": {has_content: true,  wants_more: false, description: "list of new articles by message-id follows"},
  "231": {has_content: true,  wants_more: false, description: "list of new newsgroups follows"},
  "235": {has_content: false, wants_more: false, description: "article transferred ok"},
  "240": {has_content: false, wants_more: false, description: "article posted ok"},
  "335": {has_content: false, wants_more: true,  description: "send article to be transferred.  End with <CR-LF>.<CR-LF>"},
  "340": {has_content: false, wants_more: true,  description: "send article to be posted. End with <CR-LF>.<CR-LF>"},
  "400": {has_content: false, wants_more: false, description: "service discontinued"},
  "411": {has_content: false, wants_more: false, description: "no such news group"},
  "412": {has_content: false, wants_more: false, description: "no newsgroup has been selected"},
  "420": {has_content: false, wants_more: false, description: "no current article has been selected"},
  "421": {has_content: false, wants_more: false, description: "no next article in this group"},
  "422": {has_content: false, wants_more: false, description: "no previous article in this group"},
  "423": {has_content: false, wants_more: false, description: "no such article number in this group"},
  "430": {has_content: false, wants_more: false, description: "no such article found"},
  "435": {has_content: false, wants_more: false, description: "article not wanted - do not send it"},
  "436": {has_content: false, wants_more: false, description: "transfer failed - try again later"},
  "437": {has_content: false, wants_more: false, description: "article rejected - do not try again."},
  "440": {has_content: false, wants_more: false, description: "posting not allowed"},
  "441": {has_content: false, wants_more: false, description: "posting failed"},
  "500": {has_content: false, wants_more: false, description: "command not recognized"},
  "501": {has_content: false, wants_more: false, description: "command syntax error"},
  "502": {has_content: false, wants_more: false, description: "access restriction or permission denied"},
  "503": {has_content: false, wants_more: false, description: "program fault - command not performed"},
};

var ResponseParser = module.exports = function ResponseParser() {
  this.state = STATE.INITIAL;
  this.status_code = null;
  this.status_text = null;
};

ResponseParser.prototype.write = function write(data) {
  this.buffer += data;

  this.parse(data);

  return true;
};

ResponseParser.prototype.parse = function parse(data) {
  var offset = 0;
  while (offset < data.length) {
    if (this.state === STATE.INITIAL) {
      this.state = STATE.STATUS_CODE_INITIAL;
      this.status_code = "";
      this.status_text = "";
      continue;
    }

    if (this.state === STATE.STATUS_CODE_INITIAL) {
      if (data[offset] >= "0" && data[offset] <= "9") {
        this.state = STATE.STATUS_CODE_PARTWAY;
        continue;
      } else {
        console.log("Error: expected ^[0-9], got `" + data[offset] + "'");
        break;
      }
    }

    if (this.state === STATE.STATUS_CODE_PARTWAY) {
      if (data[offset] >= "0" && data[offset] <= "9") {
        this.status_code += data[offset];
        offset++;
        continue;
      } else if (data[offset] === " " || data[offset] === "\t") {
        offset++;
        continue;
      } else {
        this.state = STATE.STATUS_TEXT;
        this.status_code = parseInt(this.status_code, 10);

        console.log("Status code: " + JSON.stringify(this.status_code));

        continue;
      }
    }

    if (this.state === STATE.STATUS_TEXT) {
      if (data[offset] !== "\r" && data[offset] !== "\n") {
        this.status_text += data[offset];
        offset++;
        continue;
      } else if (data[offset] === "\r") {
        offset++;
        continue;
      } else if (data[offset] === "\n") {
        this.state = RESPONSE[this.status_code].has_content ? STATE.CONTENT_INITIAL : STATE.INITIAL;

        console.log("Status text: " + JSON.stringify(this.status_text));

        offset++;
        continue;
      }
    }

    if (this.state === STATE.CONTENT_INITIAL) {
      if (data[offset] === ".") {
        this.state = STATE.CONTENT_MAYBE_END;
        offset++;
        continue;
      } else {
        this.state = STATE.CONTENT_PARTWAY;
        continue;
      }
    }

    if (this.state === STATE.CONTENT_MAYBE_END) {
      if (data[offset] === ".") {
        this.state = STATE.CONTENT_PARTWAY;
        continue;
      } else if (data[offset] === "\r") {
        offset++;
        continue;
      } else if (data[offset] === "\n") {
        this.state = STATE.INITIAL;
        offset++;
        continue;
      }
    }

    if (this.state === STATE.CONTENT_PARTWAY) {
      if (data[offset] === "\n") {
        this.state = STATE.CONTENT_INITIAL;
      }

      console.log("Data: " + JSON.stringify(data[offset]));

      offset++;
      continue;
    }
  }
};
