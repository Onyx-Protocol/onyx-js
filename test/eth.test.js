const assert = require('assert');
const ethers = require('ethers');
const Onyx = require('../src/index.ts');
const eth = require('../src/eth.ts');
const providerUrl = 'http://localhost:8545';

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const _window = { ethereum: require('./window.ethereum.json') };

const chainId = parseInt(process.env.CHAIN_ID, 10);
const networkName = process.env.NETWORK;

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  it('runs eth.getBalance', async function () {
    const ethBalance = await eth.getBalance(acc1.address, providerUrl);

    const ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl);
    const controlBalance = +(await ethersProvider.getBalance(acc1.address)).toString();

    const expected = controlBalance;
    assert.equal(ethBalance, expected);
  });

  it('runs eth.read', async function () {
    const oUsdcMainnetAddress = Onyx.util.getAddress(Onyx.oUSDC, networkName);
    const result = await eth.read(
      oUsdcMainnetAddress,
      'function decimals() returns (uint8)',
      [],
      { provider: providerUrl }
    );

    const expected = 8;
    assert.equal(result, expected);

  });

  it('runs eth.trx', async function () {
    // Mint some oETH by supplying ETH to the Onyx Protocol
    const oEthMainnetAddress = Onyx.util.getAddress(Onyx.oETH, networkName);

    let txReceipt;

    try {

      const trx = await eth.trx(
        oEthMainnetAddress,
        'function mint() payable',
        [],
        {
          value: ethers.utils.parseEther('1.0'),
          provider: providerUrl,
          privateKey: acc1.privateKey
        }
      );

      trxReceipt = await trx.wait(1);
    } catch (error) {
      console.error('error', error);
      console.error('txReceipt', txReceipt);
    }

    const expected = 4;
    assert.equal(trxReceipt.events.length, expected);

  });

  it('runs eth._createProvider with URL string', async function () {
    const provider = await eth._createProvider({ provider: providerUrl });

    const expected = 'JsonRpcProvider';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with URL string and private key', async function () {
    const provider = await eth._createProvider({
      provider: providerUrl,
      privateKey: '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329'
    });

    const expected = 'Wallet';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with URL string and mnemonic', async function () {
    const provider = await eth._createProvider({
      provider: providerUrl,
      mnemonic: 'clutch captain shoe salt awake harvest setup primary inmate ugly among become'
    });

    const expected = 'Wallet';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with fallback', async function () {
    const provider = await eth._createProvider({ provider: 'mainnet' });

    const expected = 'FallbackProvider';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with fallback testnet', async function () {
    const provider = await eth._createProvider({ provider: 'goerli' });

    const expected = 'FallbackProvider';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with fallback and private key', async function () {
    const provider = await eth._createProvider({
      provider: 'goerli',
      privateKey: '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329'
    });

    const expected = 'Wallet';
    const expectedChainId = chainId;
    assert.equal(provider.provider._network.chainId, expectedChainId);
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with fallback and private key', async function () {
    const provider = await eth._createProvider({
      provider: 'goerli',
      mnemonic: 'clutch captain shoe salt awake harvest setup primary inmate ugly among become'
    });

    const expected = 'Wallet';
    const expectedChainId = chainId;
    assert.equal(provider.provider._network.chainId, expectedChainId);
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with web window.ethereum object', async function () {
    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));
    window.ethereum.send = () => {};
    window.ethereum.sendAsync = () => {};
    const provider = await eth._createProvider({ provider: window.ethereum });

    // is changed from 'Web3Provider' to 'JsonRpcSigner' after .getSigner() is used
    const expected = 'JsonRpcSigner';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with an Ethers.js JsonRpcProvider', async function () {
    const ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl);
    const provider = await eth._createProvider({ provider: ethersProvider });

    const expected = 'JsonRpcProvider';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth._createProvider with an Ethers.js Web3Provider', async function () {
    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));
    window.ethereum.send = () => {};
    window.ethereum.sendAsync = () => {};

    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSigner = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    const provider = await eth._createProvider({ provider: ethersProvider });
    const signer = await eth._createProvider({ provider: ethersSigner });

    // is changed from 'Web3Provider' to 'JsonRpcSigner' after .getSigner() is used
    const expectedProvider = 'Web3Provider';
    const expectedSigner = 'JsonRpcSigner';
    assert.equal(provider.constructor.name, expectedProvider);
    assert.equal(signer.constructor.name, expectedSigner);
  });

  it('runs eth.getProviderNetwork', async function () {
    const provider = await eth._createProvider({ provider: providerUrl });
    const network = await eth.getProviderNetwork(provider);

    const expected = { id: chainId, name: networkName };
    assert.equal(network.id, expected.id);
    assert.equal(network.name, expected.name);
  });

}
