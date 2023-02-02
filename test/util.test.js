const assert = require('assert');
const util = require('../src/util.ts');

const networkName = process.env.NETWORK;

module.exports = function suite() {

  it('runs util.getAddress', async function () {
    const oEthAddress = '0x2A5eaf0CaF7a8D9104338CD06687402e181603e4';
    const result = util.getAddress('oETH', networkName);

    const expectedAddress = oEthAddress.toLowerCase();

    assert.equal(result.toLowerCase(), expectedAddress);
  });

  it('runs util.getAbi', async function () {
    const result = util.getAbi('oEther');

    const isArray = Array.isArray(result);

    assert.equal(isArray, true);
  });

  it('runs util.getNetNameWithChainId', async function () {
    const result = util.getNetNameWithChainId(5);

    const expectedResult ='goerli';

    assert.equal(result, expectedResult);
  });

}