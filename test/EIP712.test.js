const assert = require('assert');
const Onyx = require('../src/index.ts');
const ethers = require('ethers');
const providerUrl = 'http://localhost:8545';

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const _window = { ethereum: require('./window.ethereum.json') };

const patchedAddress = '0xa0df350d2637096571f7a701cbc1c5fde30df76a';
const patchedPrivateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const patchedSignature = '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd1c';

const signTypedDataV4Parameter = JSON.stringify({
  "domain": {
    "name": "Onyx",
    "chainId": 1,
    "verifyingContract": "0xc00e94Cb662C3520282E6f5717214004A7f26888"
  },
  "primaryType": "Delegation",
  "message": {
    "delegatee": "0xa0df350d2637096571f7a701cbc1c5fde30df76a",
    "nonce": 0,
    "expiry": 10000000000
  },
  "types": {
    "EIP712Domain": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "chainId",
        "type": "uint256"
      },
      {
        "name": "verifyingContract",
        "type": "address"
      }
    ],
    "Delegation": [
      {
        "name": "delegatee",
        "type": "address"
      },
      {
        "name": "nonce",
        "type": "uint256"
      },
      {
        "name": "expiry",
        "type": "uint256"
      }
    ]
  }
});

module.exports = function suite() {

  it('runs EIP712.sign as browser', async function () {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));

    window.ethereum.send = function (request, callback) {
      const { method, params } = request;

      if (
        method === 'eth_signTypedData_v4' &&
        params[0] === patchedAddress &&
        params[1] === signTypedDataV4Parameter
      ) {
        callback(null, { id: undefined, jsonrpc: "2.0", result: patchedSignature });
        return;
      }

      try {
        provider.send(method, params).then((result) => {
          callback(null, { id: undefined, jsonrpc: "2.0", result });
        });
      } catch(err) {
        callback(err);
      }
    }

    const onyx = new Onyx(window.ethereum);

    onyx._provider.getAddress = () => Promise.resolve(patchedAddress);

    const delegateSignature = await onyx.createDelegateSignature(
      patchedAddress
    );

    const expectedSignature = {
      r: '0x6cd69dff627c9bbaba58fed259f4f1a20f8fd336b7e652c39585faaf9b7ceeb5',
      s: '0x6e77e4bf4b30af12fc834f0becfde55ac733ce3034182cf7350cef5efa20d8e9',
      v: '0x1c'
    };

    assert.equal(delegateSignature.r, expectedSignature.r);
    assert.equal(delegateSignature.s, expectedSignature.s);
    assert.equal(delegateSignature.v, expectedSignature.v);
  });

  it('runs EIP712.sign as Node.js', async function () {
    const onyx = new Onyx(providerUrl, {
      privateKey: patchedPrivateKey
    });

    const delegateSignature = await onyx.createDelegateSignature(
      patchedAddress
    );

    const expectedSignature = {
      r: '0x6cd69dff627c9bbaba58fed259f4f1a20f8fd336b7e652c39585faaf9b7ceeb5',
      s: '0x6e77e4bf4b30af12fc834f0becfde55ac733ce3034182cf7350cef5efa20d8e9',
      v: '0x1c'
    };

    assert.equal(delegateSignature.r, expectedSignature.r);
    assert.equal(delegateSignature.s, expectedSignature.s);
    assert.equal(delegateSignature.v, expectedSignature.v);
  });

}
