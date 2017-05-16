class CacheUtil {
  constructor() {
    this.cache = {};
  }

  /**
   * Add new key/value pair in cache
   * @param {string} primeKey - primary identicator
   * @param {string} key - unique string value
   * @param {*} value - value object to be added in cache
   */
  add(primeKey, key, value) {
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
  get(primeKey, key) {
    if ((primeKey && key) && (this.cache.hasOwnProperty(primeKey))) {
      return this.cache[primeKey][key];
    }

    return false;
  }

  /**
   * Get cache information by prime key
   * @param {string} primeKey key where to get the cache from
   * @return {*} get cache at prime key
   */
  getByPrimeKey(primeKey) {
    return this.cache[primeKey];
  }
}

// export singleton
module.exports = new CacheUtil();
