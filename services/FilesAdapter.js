// Files Adapter
//
// Allows you to change the file storage mechanism.
// https://www.npmjs.com/package/s3
// https://github.com/parse-server-modules/parse-server-s3-adapter/blob/master/index.js
// https://github.com/parse-server-modules/parse-server-fs-adapter/blob/master/index.js
// ES6 Class https://googlechrome.github.io/samples/classes-es6/
//
// Adapter classes must implement the following functions:
// * createFile(config, filename, data)
// * getFileData(config, filename)
// * getFileLocation(config, request, filename)
//
// Default is GridStoreAdapter, which requires mongo
// and for the API server to be using the DatabaseController with Mongo
// database adapter.

import path from 'path';
import fs from 'fs';
import Jimp from 'jimp';

const { sep: pathSep } = path;

export class FilesAdapter {
  /* this method is responsible to store the file in order to be retrived later by it's file name
   *
   * @param filename the filename to save
   * @param data the buffer of data from the file
   * @param contentType the supposed contentType
   * @discussion the contentType can be undefined if the controller was not able to determine it
   *
   * @return a promise that should fail if the storage didn't succeed
   *
   */
  constructor(filesSubDirectory) {
    this._filesDir = filesSubDirectory || '';
    this._mkdir(this._getApplicationDir());
    if (!this._applicationDirExist()) {
      throw new Error("Files directory doesn't exist.");
    }
  }

  createFile(filename, data, contentType) {
    return new Promise((resolve, reject) => {
      const filepath = this._getLocalFilePath(filename);
      Jimp.read(data, (err, jimpData) => {
        console.log(jimpData.bitmap.width);
        if (err) return reject(err);
        return jimpData.resize(256, 256)
        .write(filepath)
        .getBuffer(contentType, (err2, result) => {
          if (err2) return reject(err2);
          return resolve(result);
        });
      });

      // fs.writeFile(filepath, data, (err) => {
      //   if (err) return reject(err);
      //   return resolve(data);
      // });
    });
  }

  deleteFile(filename) {
    console.log(filename);
  }

  getFileData(filename) {
    return new Promise((resolve, reject) => {
      const filepath = this._getLocalFilePath(filename);
      fs.readFile(filepath, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  getFileLocation(config, filename) {
    return `${config.mount}/files/${config.applicationId}
            ${encodeURIComponent(filename)}?size=small`;
  }

  // Helpers
  // ------------------------------
  _getApplicationDir() {
    if (!this._filesDir) return 'files';
    return path.join('files', this._filesDir);
  }

  _getLocalFilePath(filename) {
    const applicationDir = this._getApplicationDir();
    if (!fs.existsSync(applicationDir)) {
      this._mkdir(applicationDir);
    }
    return path.join(applicationDir, encodeURIComponent(filename));
  }

  _applicationDirExist() {
    return fs.existsSync(this._getApplicationDir());
  }

  _mkdir(dirPath) {
    const dirs = dirPath.split(pathSep);
    let root = '';

    while (dirs.length > 0) {
      const dir = dirs.shift();
      if (dir === '') {
        root = pathSep;
      }

      if (!fs.existsSync(path.join(root, dir))) {
        try {
          fs.mkdirSync(path.join(root, dir));
        } catch (e) {
          if (e.code === 'EACCES') {
            throw new Error(`PERMISSION ERROR: In order to use the FileSystemAdapter
                              , write access to the server's file system is required.`);
          }
        }
      }
      root = path.join(root, dir, pathSep);
    }
  }
}

export default FilesAdapter;
