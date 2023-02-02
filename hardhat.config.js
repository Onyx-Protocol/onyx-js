require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const providerUrl = process.env.MAINNET_PROVIDER_URL;
const chainId = parseInt(process.env.CHAIN_ID, 10);

if (!providerUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_PROVIDER_URL`');
  process.exit(1);
}

module.exports = {
  networks: {
    hardhat: {
      chainId,
      forking: {
        url: providerUrl,
        // blockNumber: 8250500,
      },
      gasPrice: 0,
      loggingEnabled: false,
    },
  },
  mocha: {
    timeout: 60000
  }
};
