class CacheUtil {
    constructor() {
        this.cache = {};
    }

    /**
     * Add new key/value pair in cache
     * @param primeKey - primary identicator
     * @param key - unique string value
     * @param value - value object to be added in cache
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
     * @param primeKey - primary identicator
     * @param key - key saved in cache
     * @return {*}
     */
    get(primeKey, key) {
        if ((primeKey && key) && (this.cache.hasOwnProperty(primeKey))) {
            return this.cache[primeKey][key];
        }
    }

    /**
     * Get cache information by prime key
     * @param primeKey
     * @return {*}
     */
    getByPrimeKey(primeKey) {
        return this.cache[primeKey];
    }
}

// export singleton
module.exports = new CacheUtil();