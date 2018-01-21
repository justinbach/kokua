/**
 * Tests that verify accuracy of HAL -> Hyper conversion
 */

const test = require('blue-tape');
const kokua = require('../../lib/kokua');
const _ = require('lodash');
const { loadFixture } = require('../helpers/fixture-helper');

const loadFixtures = async () => {
  const rawHyperDoc = await loadFixture('hal-hyper.json');  
  const hyperDoc = JSON.parse(rawHyperDoc);

  const rawHalDoc = await loadFixture('hal.json');
  const halDoc = JSON.parse(rawHalDoc);

  return { hyperDoc, halDoc };
};

test.skip('HAL to Hyper: Full test', async (t) => {
  const { hyperDoc: expectedHyperDoc, halDoc } = await loadFixtures();
  
  const actualHyperDoc = kokua.parse(halDoc, kokua.mt('hal'));

  t.same(actualHyperDoc, expectedHyperDoc, 
    'The translated and the test messages are equivalent'
  );
});

test('HAL to Hyper: h:head', async (t) => {
  const { hyperDoc: expectedHyperDoc, halDoc } = await loadFixtures();
  const headPath = '["h:head"]';

  const actualHyperDoc = kokua.parse(halDoc, kokua.mt('hal'));

  t.same(_.get(actualHyperDoc, headPath), _.get(expectedHyperDoc, headPath),
    'The translated and test messages have equivalent h:head properties'
  );
});

test('HAL to Hyper: h:ref', async (t) => {
  const { hyperDoc: expectedHyperDoc, halDoc } = await loadFixtures();
  const refPath = '["h:ref"]';

  const actualHyperDoc = kokua.parse(halDoc, kokua.mt('hal'));

  t.same(_.get(actualHyperDoc, refPath), _.get(expectedHyperDoc, refPath),
    'The translated and test messages have equivalent h:ref properties'
  );
});

test('HAL to Hyper: h:link', async (t) => {
  const { hyperDoc: expectedHyperDoc, halDoc } = await loadFixtures();
  const refPath = '["h:link"]';

  const actualHyperDoc = kokua.parse(halDoc, kokua.mt('hal'));

  t.same(_.get(actualHyperDoc, refPath).sort(), _.get(expectedHyperDoc, refPath).sort(),
    'The translated and test messages have equivalent h:link properties'
  );
});