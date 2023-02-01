const assert = require('assert');
const ethers = require('ethers');
const oToken = require('../src/oToken.ts');
const Onyx = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };
  const acc2 = { address: publicKeys[1], privateKey: privateKeys[1] };
  
  it('runs oToken.supply ETH', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const trx = await onyx.supply(Onyx.ETH, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs oToken.supply USDC', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await onyx.supply(Onyx.USDC, 2);
    const receipt = await supplyUsdcTrx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });
/*
  it('runs oToken.supply USDC no approve', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await onyx.supply(Onyx.USDC, 2, true);
    const receipt = await supplyUsdcTrx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Failure'), true);
    
  });*/

  it('fails oToken.supply asset type', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [supply] | Argument `asset` cannot be supplied.';
    try {
      const trx = await onyx.supply(null, 10); // bad asset type
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.supply bad amount', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [supply] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await onyx.supply('ETH', null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs oToken.redeem ETH', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 1);
    await supplyEthTrx.wait(1);

    const trx = await onyx.redeem(Onyx.ETH, 1);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs oToken.redeem USDC', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await onyx.supply(Onyx.USDC, 2);
    await supplyUsdcTrx.wait(1);

    const trx = await onyx.redeem(Onyx.USDC, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs oToken.redeem oUSDC', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await onyx.supply(Onyx.USDC, 2);
    await supplyUsdcTrx.wait(1);

    const trx = await onyx.redeem(Onyx.oUSDC, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('fails oToken.redeem bad asset', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [redeem] | Argument `asset` must be a non-empty string.';
    try {
      const trx = await onyx.redeem(null, 2); // bad asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.redeem invalid asset', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [redeem] | Argument `asset` is not supported.';
    try {
      const trx = await onyx.redeem('UUUU', 2); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.redeem invalid oToken', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [redeem] | Argument `asset` is not supported.';
    try {
      const trx = await onyx.redeem('sUUUU', 2); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.redeem bad amount', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [redeem] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await onyx.redeem(Onyx.oUSDC, null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs oToken.borrow USDC', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const trx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const events = receipt.events.map(e => e.event);

    assert.equal(events.includes('AccrueInterest'), true, 'Missing event: AccrueInterest');
    assert.equal(events.includes('Borrow'), true, 'Missing event: Borrow');
    assert.equal(events.includes('Transfer'), true, 'Missing event: Transfer');
  });

  it('runs oToken.borrow ETH', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const trx = await onyx.borrow(Onyx.ETH, 1, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const events = receipt.events.map(e => e.event);

    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Borrow'), true);
  });

  it('fails oToken.borrow invalid asset', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [borrow] | Argument `asset` cannot be borrowed.';
    try {
      const trx = await onyx.borrow('UUUU', 5); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.borrow bad amount', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [borrow] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await onyx.borrow(Onyx.USDC, null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs oToken.repayBorrow USDC', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await onyx.repayBorrow(Onyx.USDC, 5, null, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs oToken.repayBorrow ETH', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await onyx.borrow(Onyx.ETH, 1, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await onyx.repayBorrow(Onyx.ETH, 1, null, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
  });

  it('runs oToken.repayBorrow behalf USDC', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const onyx2 = new Onyx(providerUrl, {
      privateKey: acc2.privateKey
    });

    const supplyEthTrx2 = await onyx2.supply(Onyx.ETH, 2);
    await supplyEthTrx2.wait(1);

    const enterEthMarket2 = await onyx2.enterMarkets(Onyx.ETH);
    await enterEthMarket2.wait(1);

    const borrowTrx2 = await onyx2.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowTrx2.wait(1);

    const supplyEthTrx = await onyx.supply(Onyx.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await onyx.borrow(Onyx.USDC, 5, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    // acc1 repays USDCborrow on behalf of acc2
    const trx = await onyx.repayBorrow(Onyx.USDC, 5, acc2.address, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);
    const repayBorrowEvent = receipt.events.find(e => e.event === 'RepayBorrow');
    const payer = repayBorrowEvent.args[0].toLowerCase();
    const borrower = repayBorrowEvent.args[1].toLowerCase();

    const payerExpected = acc1.address.toLowerCase();
    const borrowerExpected = acc2.address.toLowerCase();
    const numEventsExpected = 4;

    assert.equal(payer, payerExpected);
    assert.equal(borrower, borrowerExpected);
    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs oToken.repayBorrow behalf ETH', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const onyx2 = new Onyx(providerUrl, {
      privateKey: acc2.privateKey
    });

    const supplyEthTrx = await onyx2.supply(Onyx.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await onyx2.enterMarkets(Onyx.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await onyx2.borrow(Onyx.ETH, 1, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await onyx.repayBorrow(Onyx.ETH, 1, acc2.address, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);
    const repayBorrowEvent = receipt.events.find(e => e.event === 'RepayBorrow');
    const payer = repayBorrowEvent.args[0].toLowerCase();
    const borrower = repayBorrowEvent.args[1].toLowerCase();

    const payerExpected = acc1.address.toLowerCase();
    const borrowerExpected = acc2.address.toLowerCase();

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
  });

  it('fails oToken.repayBorrow bad asset', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [repayBorrow] | Argument `asset` is not supported.';
    try {
      const trx = await onyx.repayBorrow(null, 1, acc2.address, false); // bad asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.repayBorrow invalid asset', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [repayBorrow] | Argument `asset` is not supported.';
    try {
      const trx = await onyx.repayBorrow('xxxx', 1, acc2.address, false); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.repayBorrow bad amount', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [repayBorrow] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await onyx.repayBorrow('USDC', null, acc2.address, false); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails oToken.repayBorrow behalf address', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [repayBorrow] | Invalid `borrower` address.';
    try {
      const trx = await onyx.repayBorrow('USDC', 1, '0xbadaddress', false); // bad address
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });
}