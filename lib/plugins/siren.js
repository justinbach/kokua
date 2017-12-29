const log      = require("metalogger")();
const _        = require("lodash");
const traverse = require("traverse");
const hutil    = require("./hutil");

class SirenPlugin {
  constructor(message) {
    if (typeof message !== 'object') {
      this.doc = JSON.parse(message);
    } else {
      this.doc = message;
    }
    this.newDoc = {};
  }

  translate() {
    this.processProperties();
    this.processTopHref();
    this.processTopLink();

    return this.newDoc;
  }

  processProperties() {
    const body = this.doc;
    for (const prop in body) {
      if (!hutil.skipProps.includes(prop) && (typeof body[prop] !== 'object')) {
        this.newDoc[prop] = body[prop];
      }
    }
    return this.newDoc;
  }

  processTopHref() {
    const hrefs = (this.doc["h:ref"]) ? this.doc["h:ref"] : {};
    if (!this.newDoc.links) this.newDoc.links = [];

    for (const href in hrefs) {
      // {"rel": ["self"], "href": "http://api.x.io/orders/42"},
      const link = {};
      link.rel = [href];
      link.href = hrefs[href];
      this.newDoc.links.push(link);
    }
  }

  processTopLink() {
    const hlinks = (this.doc["h:link"]) ? this.doc["h:link"] : [];
    if (!this.newDoc.actions) this.newDoc.actions = [];

    hlinks.forEach((hlink) => {
      const action = {};
      if (hlink["rel"]) {
        const rel = hlink["rel"][0]; // Siren actions only have one rel. Data loss may occur.
        if (rel.includes(":")) { // possible CURIE
          const [prefix, nonce] = rel.split(":");
          const validPrefix = hutil.verifyPrefix(this.doc, prefix);
          if (validPrefix) { // yeap, a CURIE
            action.name = nonce;
          } else {
            action.name = rel;
          }
        }
      }
      if (hlink["h:label"]) action.title = hlink["h:label"];
      if (hlink["action"]) action.method = hutil.actionToHTTP(hlink["action"]);
      if (hlink["uri"]) action.href = hlink["uri"];
      if (hlink["contentType"]) action.type = hlink["contentType"];

      if (hlink["fields"]) {
        action.fields = [];
        for (const fieldname in hlink["fields"]) {
          const field = {};
          field.name = fieldname;
          field.type = hlink["fields"][fieldname]["type"] ? hlink["fields"][fieldname]["type"] : "text";
          if (hlink["fields"][fieldname]["default"]) {
            field.value = hlink["fields"][fieldname]["default"];
          }
          action.fields.push(field);
        }
      }

      this.newDoc.actions.push(action);
    });
  }

  processEntities() {

  }
}

module.exports = (doc) => {
  const representor = new SirenPlugin(doc);
  return representor;
};