const assert = require('assert');
const ethers = require('ethers');
const Onyx = require('../src/index.ts');
const { request } = require('../src/util.ts');
const providerUrl = 'http://localhost:8545';

function wait(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

module.exports = function suite([ publicKeys, privateKeys ]) {

  const onyx = new Onyx(providerUrl);

  it('runs priceFeed.getPrice underlying asset to USD', async function () {
    const onyx = new Onyx(providerUrl);

    const price = await onyx.getPrice(Onyx.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice underlying asset to underlying asset', async function () {
    const onyx = new Onyx(providerUrl);

    const price = await onyx.getPrice(Onyx.UNI, Onyx.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

  });

  it('runs priceFeed.getPrice oToken to underlying asset', async function () {
    const onyx = new Onyx(providerUrl);

    const price = await onyx.getPrice(Onyx.oBUSD, Onyx.WBTC);

    const isPositiveNumber = price > 0;
    const isLessThanOne = price < 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isLessThanOne, true);
  });

  it('runs priceFeed.getPrice underlying asset to oToken', async function () {
    const onyx = new Onyx(providerUrl);

    const price = await onyx.getPrice(Onyx.UNI, Onyx.oBUSD);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });
/*
  it('runs priceFeed.getPrice oToken to oToken', async function () {
    const onyx = new Onyx(providerUrl);

    const price = await onyx.getPrice(Onyx.oBUSD, Onyx.oUSDC);

    const isPositiveNumber = price > 0;
    const isOne = price === 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isOne, true);
  });
*/
  it('runs priceFeed.getPrice for BUSD', async function () {
    const onyx = new Onyx(providerUrl);

    let price;
    try {
      price = await onyx.getPrice(Onyx.BUSD);
      // console.log('BUSD', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

}
