// https://www.npmjs.com/package/s3
// https://github.com/parse-server-modules/parse-server-s3-adapter/blob/master/index.js
// https://github.com/parse-server-modules/parse-server-fs-adapter/blob/master/index.js
// ES6 Class https://googlechrome.github.io/samples/classes-es6/

import { S3Adapter } from 'parse-server';
import Jimp from 'jimp';

export class MyS3Adapter extends S3Adapter {
  createFile(filename, data, contentType) {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!/\/(png|gif|jpg|jpeg|pjpeg)$/i.test(contentType)) return reject('File type is not supported');

      // Check file length (> 20Mb)
      if (data.length > 20971520) return reject(new Error('File too large'));

      const myFileName = filename.replace(/.[^.]+$/, '');
      const myFileExt = filename.replace(/^.*\./, '');

      return Jimp.read(data, (err, jimpData) => {
        if (err) return reject(err);
        const { width, height } = jimpData.bitmap;
        const mainImgMethod = width > 90 ?
                              { method: 'resize', width: 960, height: Jimp.AUTO } :
                              { mehod: null, width, height };
        // Main
        const mainImgPromise = this._rezieImage(jimpData, mainImgMethod)
        .then(bufferData => {
          return super.createFile(filename, bufferData, contentType);
        });

        // Medium Thumbnail
        const mediumThumbnailImgPromise = this._rezieImage(jimpData, {
          method: 'cover',
          width: 300,
          height: 300,
        })
        .then(bufferData => {
          const mediumThumbFilename = `${myFileName}_medium_thumbnail.${myFileExt}`;
          return super.createFile(mediumThumbFilename, bufferData, contentType);
        });

        // Small Thumbnail
        const smallThumbnailImgPromise = this._rezieImage(jimpData, {
          method: 'cover',
          width: 100,
          height: 100,
        })
        .then(bufferData => {
          const smallThumbFilename = `${myFileName}_small_thumbnail.${myFileExt}`;
          return super.createFile(smallThumbFilename, bufferData, contentType);
        });

        return Promise.all([
          mainImgPromise,
          mediumThumbnailImgPromise,
          smallThumbnailImgPromise,
        ])
        .then(result => {
          return resolve(result[0]);
        })
        .catch(reject);
      });
    });
  }

  static _rezieImage(jimpData, jimpMethod) {
    return new Promise((resolve, reject) => {
      const { width, height, method } = jimpMethod;
      let firstAction = jimpData;
      if (method !== null) firstAction = jimpData[method](width, height);

      return firstAction.quality(75)
        .getBuffer(jimpData._originalMime, (err, bufferData) => {
          if (err) return reject(err);
          return resolve(bufferData);
        });
    });
  }
}

export default MyS3Adapter;
