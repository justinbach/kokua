/**
 * Tests that verify accuracy of HAL -> Hyper conversion
 */

const test = require('blue-tape');
const log = require('metalogger');
const kokua = require('../../lib/kokua');
const halTranslator = require('../../lib/plugins/hal-reverse');
const _ = require('lodash');
const { loadFixture } = require('../helpers/fixture-helper');

let halDoc;
let expectedHyperDoc;

const setup = async () => {
  const rawExpectedHyperDoc = await loadFixture('hal-hyper.json');  
  expectedHyperDoc = JSON.parse(rawExpectedHyperDoc);

  const rawHalDoc = await loadFixture('hal.json');
  halDoc = JSON.parse(rawHalDoc);
};

test('HAL to Hyper: Full test', async (t) => {
  await setup();
  
  const actualHyperDoc = kokua.parse(halDoc, kokua.mt('hal'));

  t.same(actualHyperDoc, expectedHyperDoc, 
    'The translated and the test messages are equivalent'
  );
});
