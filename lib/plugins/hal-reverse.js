const _ = require("lodash");

/**
 * Detects whether a link object can be abbreviated to h:href.
 * 
 * @param {Object} link - value in HAL _links
 * @returns {Boolean}
 */
const isHrefLink = link => _.isEqual(Object.keys(link), ['href']);

/**
 * Detects whether an entry in HAL _links is a Hyper complex link.
 * 
 * @param {Object} link - value in HAL _links
 * @param {String} key - key in HAL _links
 * @return {Boolean}
 */
const isComplexLink = (link, key) => 
  !_.isEqual(Object.keys(link), ['href']) 
  && key.toLowerCase() !== 'curies';

/**
 * Extracts the Hyper template object from a HAL link href.
 * 
 * @param {String} href - href from HAL _links entry
 * @return {Object} The template object.
 */  
const getTemplate = (href) => {
  // Find occurrences of templated variables, e.g. {?id}
  const rawTemplateParams = href.match(/({.*?})/g);
  if (!rawTemplateParams) {
    throw new Error(`Unable to extract templated params from ${href}`);
  }
  // Remove brackets and punctuation
  const cleanTemplateParams = rawTemplateParams.map(t => t.replace(/[^a-zA-Z-_]/g, ''));
  return {
    'template': {
      'fields': _.reduce(
        cleanTemplateParams,
        (acc, field) => ({ ...acc, [field]: {} }),
        {}
      )
    }
  };
};

/**
 * Performs the following transformations:
 *   - 'title' -> 'label'
 *   - 'href' -> 'uri' 
 *   - templating of url parameters
 * 
 * @param {Object} halLink - normalized HAL link object with single entry
 * @return {Object} 'h:link'-compatible entry 
 */
const generateLink = (halLink) => {
  if (!Object.keys(halLink).length === 1) {
    throw new Error(`Ambiguous rel for link ${halLink}`);
  }
  const rel = Object.keys(halLink)[0];
  return {
    rel: [rel],
    ...(halLink[rel].title ? { label: halLink[rel].title } : {}),
    uri: halLink[rel].href,
    ...(halLink[rel].templated ? getTemplate(halLink[rel].href) : {}),
  };
};

/** 
 * Plugin that parses HAL into Hyper.
 */
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
    this.handleCuries();
    this.handleRefs();
    this.handleLinks();
    return this.newDoc;
  }

  handleCuries() {
    const curies = _.get(this.doc, '_links.curies');
    if (curies) {
      _.set(
        this.newDoc,
        '[h:head][curies]',
        curies.reduce(
          (acc, { name, href}) => 
            ({ 
              ...acc, 
              // @todo: do other templated vars (beyond {var}) need to be handled here?
              [name]: href.replace(/{var}$/, '')
            }), 
          {}
        )
      );
    }
  }

  /** 
   * This is an optimization, because in Hyper, refs can also be represented (more verbosely)
   * using links. 
   * 
   * Candidates for h:ref are properties of _links that only contain an href.
   */
  handleRefs() {
    const hrefs = _.pickBy(this.doc._links, isHrefLink);
    if (hrefs) {
      this.newDoc['h:ref'] = _.reduce(
        hrefs, 
        (acc, val, key) => Object.assign(acc, { [key]: val['href'] }), 
        {}
      );
    }
  }

  handleLinks() {
    const links = _.pickBy(this.doc._links, isComplexLink);
    if (links) {
      const flattenedLinks = _.reduce(
        links,
        (acc, val, key) => _.concat(acc, Array.isArray(val) ? _.map(val, v => ({ [key]: v })) : { [key]: val }),
        []
      );
      this.newDoc['h:link'] = flattenedLinks.map(generateLink);
    }
  }
}

module.exports = (doc) => new HalPlugin(doc);