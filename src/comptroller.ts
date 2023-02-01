/**
 * @file Comptroller
 * @desc These methods facilitate interactions with the Comptroller smart
 *     contract.
 */

import * as eth from './eth';
import { netId } from './helpers';
import { address, abi, oTokens } from './constants';
import { CallOptions, TrxResponse } from './types';

/**
 * Enters the user's address into Onyx Protocol markets.
 *
 * @param {any[]} markets An array of strings of markets to enter, meaning use
 *     those supplied assets as collateral.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the enterMarkets
 *     transaction.
 *
 * @example
 *
 * ```
 * const onyx = new Onyx(window.ethereum);
 * 
 * (async function () {
 *   const trx = await onyx.enterMarkets(Onyx.ETH); // Use [] for multiple
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function enterMarkets(
  markets: string | string[] = [],
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Onyx [enterMarkets] | ';

  if (typeof markets === 'string') {
    markets = [ markets ];
  }

  if (!Array.isArray(markets)) {
    throw Error(errorPrefix + 'Argument `markets` must be an array or string.');
  }

  const addresses = [];
  for (let i = 0; i < markets.length; i++) {
    if (markets[i][0] !== 'o') {
      markets[i] = 'o' + markets[i];
    }

    if (!oTokens.includes(markets[i])) {
      throw Error(errorPrefix + 'Provided market `' + markets[i] + '` is not a recognized oToken.');
    }

    addresses.push(address[this._network.name][markets[i]]);
  }

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ addresses ];

  const trxOptions: CallOptions = {
    _onyxProvider: this._provider,
    abi: abi.Comptroller,
    ...options
  };

  return eth.trx(comptrollerAddress, 'enterMarkets', parameters, trxOptions);
}

/**
 * Exits the user's address from a Onyx Protocol market.
 *
 * @param {string} market A string of the symbol of the market to exit.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 *
 * @example
 *
 * ```
 * const onyx = new Onyx(window.ethereum);
 * 
 * (async function () {
 *   const trx = await onyx.exitMarket(Onyx.ETH);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function exitMarket(
  market: string,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Onyx [exitMarket] | ';

  if (typeof market !== 'string' || market === '') {
    throw Error(errorPrefix + 'Argument `market` must be a string of a oToken market name.');
  }

  if (market[0] !== 'o') {
    market = 'o' + market;
  }

  if (!oTokens.includes(market)) {
    throw Error(errorPrefix + 'Provided market `' + market + '` is not a recognized oToken.');
  }

  const oTokenAddress = address[this._network.name][market];

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ oTokenAddress ];

  const trxOptions: CallOptions = {
    _onyxProvider: this._provider,
    abi: abi.Comptroller,
    ...options
  };

  return eth.trx(comptrollerAddress, 'exitMarket', parameters, trxOptions);
}
