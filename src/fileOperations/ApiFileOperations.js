const fileUtil = require('../commons/utils/fileUtil');
const DIRECTORY_STRUCTURE = require('../commons/constants/directoryStructure');

class ApiFileOperations {
  constructor(filePath) {
    if ((!filePath) || (typeof filePath !== 'string')) {
      throw new Error('FilePath not provided');
    }
    this.filePath = fileUtil.normalizePath(filePath);
  }

  /**
   * Create directory structure for the application
   * @returns {Promise} created directory structure.
   */
  createDirectoryStructure() {
    const promises = [];
    /* istanbul ignore next */
    if (!fileUtil.isDirectory(this.filePath)) {
      return Promise.reject('Invalid directory path');
    }
    Object.values(DIRECTORY_STRUCTURE.API_STRUCTURE).map(directory => {
      promises.push(fileUtil.createDirectory(fileUtil.joinPaths(this.filePath, directory)));
    });

    return Promise.all(promises);
  }

}

module.exports = ApiFileOperations;
