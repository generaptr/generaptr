import { Cache, Everything } from '../types';

/**
 * Class which holds helper tools when working with cache.
 *
 * @export
 * @class CacheUtil
 */
export class CacheUtil {
  /**
   * Cache registry.
   *
   * @private
   * @type {Cache}
   * @memberof CacheUtil
   */
  private cache: Cache;

  public constructor() {
    this.cache = {};
  }
  /**
   * Add new key/value pair in cache
   * @param {string} primeKey - primary identicator
   * @param {string} key - unique string value
   * @param {Everything} value - value object to be added in cache
   */
  public add(primeKey: string, key: string, value: Everything): void {
    if (!this.cache[primeKey]) {
      this.cache[primeKey] = {[key]: value};
    } else {
      this.cache[primeKey][key] = value;
    }
  }

  /**
   * Get data by key from cache
   * @param {string} primeKey - primary identicator
   * @param {string} key - key saved in cache
   * @return {*} value out of cache
   */
  public get(primeKey: string, key: string): Everything {
    if ((primeKey && key) && this.cache[primeKey]) {
      return this.cache[primeKey][key];
    }

    return false;
  }

  /**
   * Get cache information by prime key
   * @param {string} primeKey key where to get the cache from
   * @return {*} get cache at prime key
   */
  public getByPrimeKey(primeKey: string): {[key: string]: Everything} {
    return this.cache[primeKey];
  }
}

export default new CacheUtil();
