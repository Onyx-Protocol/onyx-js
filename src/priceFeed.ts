/**
 * @file Price Feed
 * @desc These methods facilitate interactions with the Open Price Feed smart
 *     contracts.
 */

import * as eth from './eth';
import { netId } from './helpers';
import {
  constants, address, abi, oTokens, underlyings, decimals, opfAssets
} from './constants';
import { CallOptions } from './types';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

function validateAsset(
  asset: string,
  argument: string,
  errorPrefix: string
) : (boolean | string | number)[] {
  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `' + argument + '` must be a non-empty string.');
  }

  const assetIsOToken = asset[0] === 'o';

  const oTokenName = assetIsOToken ? asset : 'o' + asset;
  const oTokenAddress = address[this._network.name][oTokenName];

  let underlyingName = assetIsOToken ? asset.slice(1, asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (
    (!oTokens.includes(oTokenName) || !underlyings.includes(underlyingName)) &&
    !opfAssets.includes(underlyingName)
  ) {
    throw Error(errorPrefix + 'Argument `' + argument + '` is not supported.');
  }

  const underlyingDecimals = decimals[underlyingName];

  // The open price feed reveals BTC, not WBTC.
  underlyingName = underlyingName === 'WBTC' ? 'BTC' : underlyingName;

  return [assetIsOToken, oTokenName, oTokenAddress, underlyingName, underlyingAddress, underlyingDecimals];
}

async function oTokenExchangeRate(
  oTokenAddress: string,
  oTokenName: string,
  underlyingDecimals: number
) : Promise<number> {
  const address = oTokenAddress;
  const method = 'exchangeRateCurrent';
  const options = {
    _onyxProvider: this._provider,
    abi: oTokenName === constants.oETH ? abi.oEther : abi.oErc20,
  };
  const exchangeRateCurrent = await eth.read(address, method, [], options);
  const mantissa = 18 + underlyingDecimals - 8; // oToken always 8 decimals
  const oneOTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);

  return oneOTokenInUnderlying;
}

/**
 * Gets an asset's price from the Onyx Protocol open price feed. The price
 *    of the asset can be returned in any other supported asset value, including
 *    all oTokens and underlyings.
 *
 * @param {string} asset A string of a supported asset in which to find the
 *     current price.
 * @param {string} [inAsset] A string of a supported asset in which to express
 *     the `asset` parameter's price. This defaults to USD.
 *
 * @returns {string} Returns a string of the numeric value of the asset.
 *
 * @example
 * ```
 * const onyx = new Onyx(window.ethereum);
 * let price;
 * 
 * (async function () {
 * 
 *   price = await onyx.getPrice(Onyx.WBTC);
 *   console.log('WBTC in USD', price); // 6 decimals, see Open Price Feed docs
 * 
 *   price = await onyx.getPrice(Onyx.ETH, Onyx.USDC); // supports oTokens too
 *   console.log('ETH in USDC', price);
 * 
 * })().catch(console.error);
 * ```
 */
 export async function getPrice(
  asset: string,
  inAsset: string = constants.USDC
) : Promise<number> {
  await netId(this);
  const errorPrefix = 'Onyx [getPrice] | ';

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assetIsOToken, oTokenName, oTokenAddress, underlyingName, underlyingAddress, underlyingDecimals
  ] = validateAsset.bind(this)(asset, 'asset', errorPrefix);

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inAssetIsOToken, inAssetOTokenName, inAssetOTokenAddress, inAssetUnderlyingName, inAssetUnderlyingAddress, inAssetUnderlyingDecimals
  ] = validateAsset.bind(this)(inAsset, 'inAsset', errorPrefix);

  const comptrollerAddress = address[this._network.name].Comptroller;

  const oracleTrxOptions: CallOptions = {
    _onyxProvider: this._provider,
    abi: abi.Comptroller,
  };
  const priceOracleAddress = await eth.read(comptrollerAddress, 'oracle', [], oracleTrxOptions);

  // const trxOptions: CallOptions = {
  //   _compoundProvider: this._provider,
  //   abi: abi.PriceFeed,
  // };

  // const assetUnderlyingPrice = await eth.read(priceFeedAddress, 'price', [ underlyingName ], trxOptions);
  // const inAssetUnderlyingPrice =  await eth.read(priceFeedAddress, 'price', [ inAssetUnderlyingName ], trxOptions);

  const trxOptions: CallOptions = {
    _onyxProvider: this._provider,
    abi: abi.PriceOracle,
  };
  let assetUnderlyingPrice = await eth.read(priceOracleAddress, 'getUnderlyingPrice', [ oTokenAddress ], trxOptions);
  const inAssetUnderlyingPrice =  await eth.read(priceOracleAddress, 'getUnderlyingPrice', [ inAssetOTokenAddress ], trxOptions);

  const assetDecimal = decimals[asset];
  const inAssetDecimal = decimals[inAsset];
  if ((assetDecimal-inAssetDecimal) > 0) {
    assetUnderlyingPrice = assetUnderlyingPrice.mul(BigNumber.from("10").pow(assetDecimal-inAssetDecimal));
  } else {
    assetUnderlyingPrice = assetUnderlyingPrice.div(BigNumber.from("10").pow(inAssetDecimal-assetDecimal));
  }  

  let assetOTokensInUnderlying, inAssetOTokensInUnderlying;

  if (assetIsOToken) {
    assetOTokensInUnderlying = await oTokenExchangeRate.bind(this)(oTokenAddress, oTokenName, underlyingDecimals);
  }

  if (inAssetIsOToken) {
    inAssetOTokensInUnderlying = await oTokenExchangeRate.bind(this)(inAssetOTokenAddress, inAssetOTokenName, inAssetUnderlyingDecimals);
  }

  let result;
  if (!assetIsOToken && !inAssetIsOToken) {
    result = assetUnderlyingPrice / inAssetUnderlyingPrice;
  } else if (assetIsOToken && !inAssetIsOToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther * assetOTokensInUnderlying;
  } else if (!assetIsOToken && inAssetIsOToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther / inAssetOTokensInUnderlying;
  } else {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    const oTokensInUnderlying = assetInOther / assetOTokensInUnderlying;
    result = inAssetOTokensInUnderlying * oTokensInUnderlying;
  }

  return result;
}
