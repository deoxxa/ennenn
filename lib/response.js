var TYPE = {
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

var Steez = require("steez"),
    util = require("util");

var Response = module.exports = function Response(status_code, status_text, has_content, wants_more) {
  Steez.call(this);

  this.status_code = status_code;
  this.status_text = status_text;
  this.has_content = has_content;
  this.wants_more = wants_more;
};
util.inherits(Response, Steez);

Response.TYPE = TYPE;
