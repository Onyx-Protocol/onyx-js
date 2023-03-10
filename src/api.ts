/**
 * @file API
 * @desc These methods facilitate HTTP requests to the Onyx API.
 */

import { request } from './util';
import {
  APIRequest,
  APIResponse,
  AccountServiceRequest,
  OTokenServiceRequest,
  MarketHistoryServiceRequest,
  GovernanceServiceRequest,
} from './types';

// import { version } from '../package.json';

// let userPlatform;

// try {
//   if (typeof document !== 'undefined') {
//     userPlatform = 'web';
//   } else if (
//     typeof navigator !== 'undefined' &&
//     navigator.product === 'ReactNative'
//   ) {
//     userPlatform = 'react-native';
//   } else if (
//     typeof navigator !== 'undefined' && 
//     navigator.userAgent.toLowerCase().indexOf('electron') > -1
//   ) {
//     userPlatform = 'electron-js';
//   } else {
//     userPlatform = 'node-js';
//   }
// } catch (e) {
//   userPlatform = 'unknown';
// }

/**
 * Makes a request to the AccountService API. The Account API retrieves
 *     information for various accounts which have interacted with the protocol.
 *     For more details, see the Onyx API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const account = await Onyx.api.account({
 *     "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
 *     "network": "goerli"
 *   });
 * 
 *   let busdBorrowBalance = 0;
 *   if (Object.isExtensible(account) && account.accounts) {
 *     account.accounts.forEach((acc) => {
 *       acc.tokens.forEach((tok) => {
 *         if (tok.symbol === Onyx.oBUSD) {
 *           busdBorrowBalance = +tok.borrow_balance_underlying.value;
 *         }
 *       });
 *     });
 *   }
 * 
 *   console.log('busdBorrowBalance', busdBorrowBalance);
 * })().catch(console.error);
 * ```
 */
export function account(options: AccountServiceRequest) : Promise<APIResponse> {
  return queryApi(options, 'account', '/api/v2/account');
}

/**
 * Makes a request to the OTokenService API. The oToken API retrieves
 *     information about oToken contract interaction. For more details, see the 
 *     Onyx API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const oBusdData = await Onyx.api.oToken({
 *     "addresses": Onyx.util.getAddress(Onyx.oUSDT)
 *   });
 * 
 *   console.log('oBusdData', oBusdData); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function oToken(options: OTokenServiceRequest) : Promise<APIResponse> {
  return queryApi(options, 'oToken', '/api/v2/otoken');
}

/**
 * Makes a request to the MarketHistoryService API. The market history service
 *     retrieves information about a market. For more details, see the Onyx
 *     API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const oUsdcMarketData = await Onyx.api.marketHistory({
 *     "asset": Onyx.util.getAddress(Onyx.oUSDC),
 *     "min_block_timestamp": 1559339900,
 *     "max_block_timestamp": 1598320674,
 *     "num_buckets": 10,
 *   });
 * 
 *   console.log('oUsdcMarketData', oUsdcMarketData); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function marketHistory(options: MarketHistoryServiceRequest) : Promise<APIResponse> {
  return queryApi(options, 'Market History', '/api/v2/market_history/graph');
}

/**
 * Makes a request to the GovernanceService API. The Governance Service includes
 *     three endpoints to retrieve information about XCN accounts. For more 
 *     details, see the Onyx API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 * @param {string} endpoint A string of the name of the corresponding governance
 *     service endpoint. Valid values are `proposals`, `voteReceipts`, or
 *     `accounts`.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const proposal = await Onyx.api.governance(
 *     { "proposal_ids": [ 20 ] }, 'proposals'
 *   );
 * 
 *   console.log('proposal', proposal); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function governance(options: GovernanceServiceRequest, endpoint: string) : Promise<APIResponse> {
  if (endpoint === 'proposals') {
    endpoint = '/api/v2/governance/proposals';
  } else if (endpoint === 'voteReceipts') {
    endpoint = '/api/v2/governance/proposal_vote_receipts';
  } else {
    endpoint = '/api/v2/governance/accounts';
  }

  return queryApi(options, 'GovernanceService', endpoint);
}

function queryApi(options: APIRequest, name: string, path: string) : Promise<APIResponse> {
  return new Promise((resolve, reject) => {
    const errorPrefix = `Onyx [api] [${name}] | `;
    let responseCode, responseMessage;

    request({
      hostname: 'https://api.onyx.org',
      path,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        // 'onyx-js': `[${version}]_[${userPlatform}]`,
      },
      body: options
    }).then((response) => {
      responseCode = response.status;
      responseMessage = response.statusText;

      const responseBody = JSON.parse(response.body);

      if (responseCode >= 200 && responseCode <= 299) {
        resolve(responseBody);
      } else {
        throw 'Invalid request made to the Onyx API.';
      }
    }).catch((error) => {
      let errorMessage = '';

      if (error.name === 'SyntaxError') {
        errorMessage = errorPrefix + `Unable to parse response body.`;
      } else {
        errorMessage = errorPrefix + error.toString();
      }

      reject({ error: errorMessage, responseCode, responseMessage });
    });
  });
}
