const log      = require("metalogger")();
const _        = require("lodash");
const traverse = require("traverse");

class HalPlugin {

  constructor(message) {
    if (typeof message !== 'object') {
      this.doc = JSON.parse(message);
    } else {
      this.doc = message;
    }
    this.newDoc = {};
  }

  translate() {
    return this.newDoc;
  }
}

module.exports = (doc) => {
  const representor = new HalPlugin(doc);
  return representor;
};