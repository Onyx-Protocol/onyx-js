const assert = require('assert');
const Onyx = require('../src/index.ts');

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const _window = { ethereum: require('./window.ethereum.json') };

const providerUrl = 'http://localhost:8545';
const unlockedPrivateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const unlockedMnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

module.exports = function suite() {

  it('initializes onyx with ethers default provider', async function () {
    const onyx = new Onyx();

    const expectedType = 'object';

    assert.equal(typeof onyx, expectedType);
  });

  it('initializes onyx with JSON RPC URL', async function () {
    const onyx = new Onyx(providerUrl);

    const expectedType = 'object';

    assert.equal(typeof onyx, expectedType);
  });

  it('initializes onyx with mnemonic', async function () {
    const onyx = new Onyx(providerUrl, {
      mnemonic: unlockedMnemonic
    });

    const expectedType = 'object';

    assert.equal(typeof onyx, expectedType);
  });

  it('initializes onyx with private key', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: unlockedPrivateKey
    });

    const expectedType = 'object';

    assert.equal(typeof onyx, expectedType);
  });

  it('initializes onyx as web3', async function () {
    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));

    window.ethereum.send = function (request, callback) {}
    const onyx = new Onyx(window.ethereum);

    const expectedType = 'object';

    assert.equal(typeof onyx, expectedType);
  });

}