import { OnyxInstance } from './types';

/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Onyx Protocol addresses, the
 *     Onyx.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @hidden
 *
 * @param {Onyx} _onyx The instance of the Onyx.js SDK.
 *
 */
export async function netId(_onyx: OnyxInstance): Promise<void> {
  if (_onyx._networkPromise) {
    await _onyx._networkPromise;
  }
}
