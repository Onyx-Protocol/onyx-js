/**
 * @file Onyx
 * @desc This file defines the constructor of the `Onyx` class.
 * @hidden
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as comptroller from './comptroller';
import * as oToken from './oToken';
import * as priceFeed from './priceFeed';
import * as xcn from './xcn';
import * as gov from './gov';
import * as api from './api';
import { constants, decimals } from './constants';
import { Provider, OnyxOptions, OnyxInstance } from './types';

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Onyx.js SDK.
 *
 * @param {Provider | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {object} [options] Optional provider options.
 *
 * @example
 * ```
 * var onyx = new Onyx(window.ethereum); // web browser
 * 
 * var onyx = new Onyx('http://127.0.0.1:8545'); // HTTP provider
 * 
 * var onyx = new Onyx(); // Uses Ethers.js fallback mainnet (for testing only)
 * 
 * var onyx = new Onyx('goerli'); // Uses Ethers.js fallback (for testing only)
 * 
 * // Init with private key (server side)
 * var onyx = new Onyx('https://mainnet.infura.io/v3/_your_project_id_', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 * 
 * // Init with HD mnemonic (server side)
 * var onyx = new Onyx('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of the Onyx.js SDK.
 */
const Onyx = function(
  provider: Provider | string = 'mainnet', options: OnyxOptions = {}
) : OnyxInstance {
  const originalProvider = provider;

  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = {
    _originalProvider: originalProvider,
    _provider: provider,
    ...comptroller,
    ...oToken,
    ...priceFeed,
    ...gov,
    claimXcn: xcn.claimXcn,
    delegate: xcn.delegate,
    delegateBySig: xcn.delegateBySig,
    createDelegateSignature: xcn.createDelegateSignature,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
};

Onyx.eth = eth;
Onyx.api = api;
Onyx.util = util;
Onyx._ethers = ethers;
Onyx.decimals = decimals;
Onyx.xcn = {
  getXcnBalance: xcn.getXcnBalance,
  getXcnAccrued: xcn.getXcnAccrued,
};
Object.assign(Onyx, constants);

export = Onyx;
