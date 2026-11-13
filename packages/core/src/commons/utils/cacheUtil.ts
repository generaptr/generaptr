import { Cache, Everything } from '../types';

/**
 * Class which holds helper tools when working with cache.
 *
 * @export
 */
export class CacheUtil {
  /**
   * Cache registry.
   *
   */
  private readonly cache: Cache;

  public constructor() {
    this.cache = {};
  }
  /**
   * Add new key/value pair in cache
   * @param primeKey - primary identicator
   * @param key - unique string value
   * @param value - value object to be added in cache
   */
  public add(primeKey: string, key: string, value: Everything): void {
    if (!this.cache[primeKey]) {
      this.cache[primeKey] = { [key]: value };
    } else {
      this.cache[primeKey][key] = value;
    }
  }

  /**
   * Get data by key from cache
   * @param primeKey - primary identicator
   * @param key - key saved in cache
   * @return  value out of cache
   */
  public get(primeKey: string, key: string): Everything {
    if ((primeKey && key) && this.cache[primeKey]) {
      return this.cache[primeKey][key];
    }

    return false;
  }

  /**
   * Get cache information by prime key
   * @param primeKey key where to get the cache from
   * @return  get cache at prime key
   */
  public getByPrimeKey(primeKey: string): { [key: string]: Everything } {
    return this.cache[primeKey];
  }
}

export default new CacheUtil();
