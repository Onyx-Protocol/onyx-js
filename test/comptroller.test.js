const assert = require('assert');
const ethers = require('ethers');
const comptroller = require('../src/comptroller.ts');
const Onyx = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  it('runs comptroller.enterMarkets single asset', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const trx = await onyx.enterMarkets(Onyx.ETH);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 1;
    const eventExpected = 'MarketEntered';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('runs comptroller.enterMarkets multiple assets', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const trx = await onyx.enterMarkets(
      [ Onyx.BUSD, Onyx.USDC, Onyx.UNI ]
    );
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 3;
    const eventExpected = 'MarketEntered';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('fails comptroller.enterMarkets oToken string', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [enterMarkets] | Argument `markets` must be an array or string.';
    try {
      const trx = await onyx.enterMarkets(null);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails comptroller.enterMarkets invalid oToken', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [enterMarkets] | Provided market `obadotokenname` is not a recognized oToken.';
    try {
      const trx = await onyx.enterMarkets(['USDC', 'badotokenname']);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs comptroller.exitMarket', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const enterMarketsTrx = await onyx.enterMarkets(Onyx.ETH);
    await enterMarketsTrx.wait(1);

    const trx = await onyx.exitMarket(Onyx.ETH);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 1;
    const eventExpected = 'MarketExited';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('fails comptroller.exitMarket oToken string', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [exitMarket] | Argument `market` must be a string of a oToken market name.';
    try {
      const trx = await onyx.exitMarket(null);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails comptroller.exitMarket invalid oToken', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [exitMarket] | Provided market `obadotokenname` is not a recognized oToken.';
    try {
      const trx = await onyx.exitMarket('badotokenname');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
