/**
 * Tests that verify accurace of Hyper -> Siren conversion
 */
const test          = require('blue-tape');
// const test          = require('tap').test;
const log           = require('metalogger')(); // eslint-disable-line no-unused-vars
const kokua         = require ('../../lib/kokua');
const sirenTranslator = require('../../lib/plugins/siren');
const loadFixture   = require('../helpers/fixture-helper').loadFixture;

let sirenDoc, hyperDoc;

async function setup() {
  sirenDoc = await loadFixture('siren-generated.json');
  sirenDoc = JSON.parse(sirenDoc);
  // Note: loaded fixtures are string, not objects, but Kokua can handle it
  hyperDoc = await loadFixture('siren-hyper.json');
}

test('Hyper to Siren: Top-Level Properties', async t => {
  await setup();

  const st = sirenTranslator(hyperDoc);
  st.processProperties();
  const docTranslated = st.newDoc;

  const expected = {
    "properties": {
      "orderNumber": 42, "foonull": null, "itemCount": 3, "status": "pending"
    }, "class": [ "order" ]
  };
  t.same(docTranslated, expected, "Converted properly");
});

test('Hyper to Siren: Top-Level H:Refs', async t => {
  await setup();
  const docTranslated = kokua(hyperDoc, kokua.mt('siren'));

  const expected = [
    {"rel": ["self"], "href": "http://api.x.io/orders/42"},
    {"rel": ["previous"], "href": "http://api.x.io/orders/41"},
    {"rel": ["next"], "href": "http://api.x.io/orders/43"}
  ];
  t.same(docTranslated.links, expected, "Converted properly");
});

test('Hyper to Siren: Top-Level Links', async t => {
  await setup();
  const docTranslated = kokua(hyperDoc, kokua.mt('siren'));

  const expected = [
    {
      "name": "add-item",
      "title": "Add Item",
      "href": "http://api.x.io/orders/42/items",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {"name": "orderNumber", "type": "hidden", "value": "42"},
        {"name": "productCode", "type": "text"},
        {"name": "quantity", "type": "number"}
      ],
      "method": "POST"
    }
  ];
  t.same(docTranslated.actions, expected, "Converted properly");
});

test('Hyper to Siren: Process Entities', async t => {
  await setup();

  const st = sirenTranslator(hyperDoc);
  st.processEntities();
  const docTranslated = st.newDoc;

  const expected = sirenDoc.entities;

  t.same(docTranslated.entities, expected, "Converted properly");
});

test('Hyper to Siren: Full Test', async t => {
  await setup();
  const docTranslated = kokua(hyperDoc, kokua.mt('siren'));

  t.same(docTranslated, sirenDoc, "Converted properly");
});
