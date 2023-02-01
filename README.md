# Onyx.js

A JavaScript SDK for Ethereum and the Onyx Protocol. Wraps around [Ethers.js](https://github.com/ethers-io/ethers.js/). Works in the **web browser** and **Node.js**.

[Onyx.js Documentation](https://docs.onyx.org/onyx.js)

This SDK is in **open beta**, and is constantly under development. **USE AT YOUR OWN RISK**.

## Ethereum Read & Write

JSON RPC based Ethereum **read** and **write**.

### Read

```js
const Onyx = require('@onyx-finance/onyx-js'); // in Node.js
const oUsdtAddress = Onyx.util.getAddress(Onyx.oUSDT);

(async function() {

  let supplyRatePerBlock = await Onyx.eth.read(
    oUsdtAddress,
    'function supplyRatePerBlock() returns (uint)',
    [], // [optional] parameters
    {}  // [optional] call options, provider, network, ethers.js "overrides"
  );

  console.log('USDT supplyRatePerBlock:', supplyRatePerBlock.toString());

})().catch(console.error);
```

### Write

```js
const toAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';

(async function() {

  const trx = await Onyx.eth.trx(
    toAddress,
    'function send() external payable',
    [],
    {
      value: Onyx._ethers.utils.parseEther('1.0'), // 1 ETH
      provider: window.ethereum, // in a web browser
    }
  );

  const toAddressEthBalance = await Onyx.eth.getBalance(toAddress);

})().catch(console.error);
```

## Onyx Protocol

Simple methods for using the Onyx protocol.

```js
const onyx = new Onyx(window.ethereum); // in a web browser

// Ethers.js overrides are an optional 3rd parameter for `supply`
// const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Onyx protocol...');
  const trx = await onyx.supply(Onyx.ETH, 1);
  console.log('Ethers.js transaction object', trx);

})().catch(console.error);
```

## Install / Import

Web Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@onyx-finance/onyx-js@latest/dist/browser/onyx.min.js"></script>

<script type="text/javascript">
  window.Onyx; // or `Onyx`
</script>
```

Node.js

```
npm install @onyx-finance/onyx-js
```

```js
const Onyx = require('@onyx-finance/onyx-js');

// or, when using ES6

import Onyx from '@onyx-finance/onyx-js';
```

## More Code Examples

See the docblock comments above each function definition or the official [Onyx.js Documentation](https://docs.onyx.org/onyx.js).

## Instance Creation

The following are valid Ethereum providers for initialization of the SDK.

```js
var onyx = new Onyx(window.ethereum); // web browser

var onyx = new Onyx('http://127.0.0.1:8545'); // HTTP provider

var onyx = new Onyx(); // Uses Ethers.js fallback mainnet (for testing only)

var onyx = new Onyx('goerli'); // Uses Ethers.js fallback (for testing only)

// Init with private key (server side)
var onyx = new Onyx('https://mainnet.infura.io/v3/_your_project_id_', {
  privateKey: '0x_your_private_key_', // preferably with environment variable
});

// Init with HD mnemonic (server side)
var onyx = new Onyx('mainnet' {
  mnemonic: 'clutch captain shoe...', // preferably with environment variable
});
```

## Constants and Contract Addresses

Names of contracts, their addresses, ABIs, token decimals, and more can be found in `/src/constants.ts`. Addresses, for all networks, can be easily fetched using the `getAddress` function, combined with contract name constants.

```js
console.log(Onyx.BUSD, Onyx.ETH, Onyx.oETH);
// BUSD, ETH, oETH

const oUsdtAddress = Onyx.util.getAddress(Onyx.oUSDT);
// Mainnet oUSDT address. Second parameter can be a network like 'goerli'.
```

## Mantissas

Parameters of number values can be plain numbers or their scaled up mantissa values. There is a transaction option boolean to tell the SDK what the developer is passing.

```js
// 1 Busd
await onyx.borrow(Onyx.BUSD, '1000000000000000000', { mantissa: true });

// `mantissa` defaults to false if it is not specified or if an options object is not passed
await onyx.borrow(Onyx.BUSD, 1, { mantissa: false });
```

## Transaction Options

Each method that interacts with the blockchain accepts a final optional parameter for overrides, much like [Ethers.js overrides](https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides).
```js
// The options object itself and all options are optional
const trxOptions = {
  mantissa,   // Boolean, parameters array arg of 1 ETH would be '1000000000000000000' (true) vs 1 (false)
  abi,        // Definition string or an ABI array from a solc build
  provider,   // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
  network,    // Ethers.js fallback network provider, "provider" has precedence over "network"
  from,       // Address that the Ethereum transaction is send from
  gasPrice,   // Ethers.js override `Onyx._ethers.utils.parseUnits('10.0', 'gwei')`
  gasLimit,   // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  value,      // Number or string
  data,       // Number or string
  chainId,    // Number
  nonce,      // Number
  privateKey, // String, meant to be used with `Onyx.eth.trx` (server side)
  mnemonic,   // String, meant to be used with `Onyx.eth.trx` (server side)
};
```

## API

The [Onyx API](https://docs.onyx.org/api) is accessible from Onyx.js. The corresponding services are defined in the `api` namespace on the class.

- `Onyx.api.account`
- `Onyx.api.oToken`
- `Onyx.api.marketHistory`
- `Onyx.api.governance`

The governance method requires a second parameter (string) for the corresponding endpoint shown in the [documentation](https://docs.onyx.org/governance).

- `proposals`
- `voteReceipts`
- `accounts`

Here is an example for using the `account` endpoint. The `network` parameter in the request body is optional and defaults to `mainnet`.

```js
const main = async () => {
  const account = await Onyx.api.account({
    "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
    "network": "goerli"
  });

  let busdBorrowBalance = 0;
  if (Object.isExtensible(account) && account.accounts) {
    account.accounts.forEach((acc) => {
      acc.tokens.forEach((tok) => {
        if (tok.symbol === Onyx.oBUSD) {
          busdBorrowBalance = +tok.borrow_balance_underlying.value;
        }
      });
    });
  }

  console.log('busdBorrowBalance', busdBorrowBalance);
}

main().catch(console.error);
```

## Test

Tests are available in `./test/*.test.js`. The tests are configured in `./test/index.js`. Methods are tested using a forked chain using ganache-core. A JSON RPC provider URL needs to be configured as an environment variable before running the tests (`MAINNET_PROVIDER_URL`). Archive state must be available to run the tests. For free archive node access, get a provider URL from [Alchemy](http://alchemy.com/).

```
## Run all tests
npm test

## Run a single test (Mocha JS grep option)
npm test -- -g 'runs eth.getBalance'
```

## Build for Node.js & Web Browser

```
git clone git@github.com:Onyx-Protocol/onyx-js.git
cd onyx-js/
npm install
npm run build
```

### Web Browser Build
```html
<!-- Local build (do `npm install` first) -->
<script type="text/javascript" src="./dist/browser/onyx.min.js"></script>

<!-- Public NPM -> jsdeliver build -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@onyx-finance/onyx-js@latest/dist/browser/onyx.min.js"></script>
```

### Node.js Build
```js
// Local build (do `npm install` first)
const Onyx = require('./dist/nodejs/index.js');

// Public NPM build
const Onyx = require('@onyx-finance/onyx-js');
```
