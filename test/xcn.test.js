const assert = require('assert');
const ethers = require('ethers');
const xcn = require('../src/xcn.ts');
const Onyx = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

const unlockedAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';
const unlockedPk = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

function getNonce(address, xcnAddress, _providerUrl) {
  return new Promise((resolve, reject) => {
    Onyx.eth.read(
      xcnAddress,
      'function nonces(address) returns (uint)',
      [ address ],
      { provider: _providerUrl }
    ).then(resolve).catch(reject);
  });
}

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  it('runs xcn.getOnyxBalance', async function () {
    const bal = await xcn.getOnyxBalance(acc1.address, providerUrl);

    const expected = 0;
    assert.equal(bal, expected);
  });

  it('fails xcn.getOnyxBalance address string', async function () {
    const errorMessage = 'Onyx [getOnyxBalance] | Argument `_address` must be a string.';

    try {
      await xcn.getOnyxBalance(1, providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.getOnyxBalance address invalid', async function () {
    const errorMessage = 'Onyx [getOnyxBalance] | Argument `_address` must be a valid Ethereum address.';

    try {
      await xcn.getOnyxBalance('bad_ethereum_address', providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs xcn.getOnyxAccrued', async function () {
    const accrued = await xcn.getOnyxAccrued(acc1.address, providerUrl);

    const expected = 0;
    assert.equal(accrued, expected);
  });

  it('fails xcn.getOnyxAccrued address string', async function () {
    const errorMessage = 'Onyx [getOnyxAccrued] | Argument `_address` must be a string.';

    try {
      await xcn.getOnyxAccrued(1, providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.getOnyxAccrued address invalid', async function () {
    const errorMessage = 'Onyx [getOnyxAccrued] | Argument `_address` must be a valid Ethereum address.';

    try {
      await xcn.getOnyxAccrued('bad_ethereum_address', providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });


  it('runs xcn.claimOnyx', async function () {
    let txReceipt;

    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    try {
      const claimOnyxTx = await onyx.claimOnyx({
        gasLimit: ethers.utils.parseUnits('5000000', 'wei') // set when prices were unusually high
      });
      txReceipt = await claimOnyxTx.wait(1);
    } catch (error) {
      console.error('error', error);
      console.error('txReceipt', txReceipt);
    }

    const status = txReceipt.status;
    const expectedStatus = 1;

    const events = txReceipt.events.map(e => e.event);

    assert.equal(status, expectedStatus);
    assert.equal(events.includes('DistributedSupplierOnyx'), true, 'Missing event: DistributedSupplierOnyx');
    assert.equal(events.includes('DistributedBorrowerOnyx'), true, 'Missing event: DistributedBorrowerOnyx');

  });

  it('runs xcn.delegate', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    let txReceipt;

    try {
      const delegateTx = await onyx.delegate(acc1.address);
      txReceipt = await delegateTx.wait(1);
    } catch (error) {
      console.error('error', error);
      console.error('txReceipt', txReceipt);
    }

    const event = txReceipt.events[0].event;
    const delegatee = txReceipt.events[0].args[2].toLowerCase();

    const expectedEvent = 'DelegateChanged';
    const expectedDelegatee = acc1.address.toLowerCase();

    assert.equal(event, expectedEvent);
    assert.equal(delegatee, expectedDelegatee);
  });

  it('fails xcn.delegate address string', async function () {
    const errorMessage = 'Onyx [delegate] | Argument `_address` must be a string.';

    try {
      await xcn.delegate(1, providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.delegate address invalid', async function () {
    const errorMessage = 'Onyx [delegate] | Argument `_address` must be a valid Ethereum address.';

    try {
      await xcn.delegate('bad_ethereum_address', providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs xcn.createDelegateSignature', async function () {
    const _onyx = new Onyx(providerUrl, {
      privateKey: unlockedPk
    });

    const expiry = 10e9;
    const delegateSignature = await _onyx.createDelegateSignature(
      unlockedAddress,
      expiry
    );

    const expectedSignature = {
      r: '0x6cd69dff627c9bbaba58fed259f4f1a20f8fd336b7e652c39585faaf9b7ceeb5',
      s: '0x6e77e4bf4b30af12fc834f0becfde55ac733ce3034182cf7350cef5efa20d8e9',
      v: '0x1c'
    }

    assert.equal(delegateSignature.r, expectedSignature.r);
    assert.equal(delegateSignature.s, expectedSignature.s);
    assert.equal(delegateSignature.v, expectedSignature.v);
  });

  it('runs xcn.delegateBySig', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const xcnAddress = Onyx.util.getAddress(Onyx.XCN);
    const nonce = +(await getNonce(acc1.address, xcnAddress, providerUrl)).toString();
    const expiry = 10e9;
    const signature = await onyx.createDelegateSignature(
      acc1.address,
      expiry
    );

    const delegateTx = await onyx.delegateBySig(
      acc1.address,
      nonce,
      expiry,
      signature,
    );

    const txReceipt = await delegateTx.wait(1);

    const toDelegate = txReceipt.events[0].args.toDelegate.toLowerCase();
    const expectedToDelegate = acc1.address.toLowerCase();

    assert.equal(toDelegate, expectedToDelegate);
  });

  it('fails xcn.delegateBySig address string', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [delegateBySig] | Argument `_address` must be a string.';
    try {
      const delegateTx = await onyx.delegateBySig(
        123, // bad
        1,
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.delegateBySig address invalid', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [delegateBySig] | Argument `_address` must be a valid Ethereum address.';
    try {
      const delegateTx = await onyx.delegateBySig(
        '0xbadaddress', // bad
        1,
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.delegateBySig nonce', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [delegateBySig] | Argument `nonce` must be an integer.';
    try {
      const delegateTx = await onyx.delegateBySig(
        '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A',
        'abc', // bad
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.delegateBySig expiry', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [delegateBySig] | Argument `expiry` must be an integer.';
    try {
      const delegateTx = await onyx.delegateBySig(
        '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A',
        1,
        null, // bad
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails xcn.delegateBySig signature', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: acc1.privateKey
    });

    const errorMessage = 'Onyx [delegateBySig] | Argument `signature` must be an object that contains the v, r, and s pieces of an EIP-712 signature.';
    try {
      const delegateTx = await onyx.delegateBySig(
        '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A',
        1,
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '', // bad
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
