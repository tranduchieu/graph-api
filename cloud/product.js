/* global Parse */
import url from 'url';
import path from 'path';

const bucket = process.env.S3_BUCKET || 'ecolab-server';
const bucketPrefix = process.env.S3_BUCKET_PREFIX || '';
const s3Host = `${bucket}.s3.amazonaws.com`;

Parse.Cloud.afterSave('Product', (req, res) => {
  // const boxes = req.object.get('boxes');
  return res.success();
});

const checkImgSrc = (imgSrc) => {
  return new Promise((resolve, reject) => {
    return Parse.Cloud.httpRequest({
      url: imgSrc,
    })
    .then(() => {
      return resolve(imgSrc);
    })
    .catch(() => {
      return reject(new Error(`Image URL ${imgSrc} not available`));
    });
  });
};

const updateImagesArray = (imgArray) => {
  return new Promise((resolve, reject) => {
    if (imgArray === undefined) return reject(new Error('Images array undefined'));
    if (imgArray === null || imgArray.length === 0 || typeof imgArray[0] === 'object') return resolve(imgArray);
    if (Array.isArray(imgArray) === false) return reject(new Error('Images is not Array'));

    const newImgArrayPromise = imgArray.map((imgSrc) => {
      const urlParsed = url.parse(imgSrc);

      //  Check host
      if (urlParsed.host !== s3Host) return reject(new Error(`Image url host ${urlParsed.host} not define`));
      const filename = path.basename(urlParsed.pathname);

      const myFileName = filename.replace(/.[^.]+$/, '');
      const myFileExt = filename.replace(/^.*\./, '');

      const mediumThumbnailImgSrc = `${urlParsed.protocol}//${s3Host}/${bucketPrefix + myFileName}_medium_thumbnail.${myFileExt}`;
      const smallThumbnailImgSrc = `${urlParsed.protocol}//${s3Host}/${bucketPrefix + myFileName}_small_thumbnail.${myFileExt}`;

      return Promise.all([
        checkImgSrc(imgSrc),
        checkImgSrc(mediumThumbnailImgSrc),
        checkImgSrc(smallThumbnailImgSrc),
      ]);
    });

    return Promise.all(newImgArrayPromise)
    .then(result => {
      console.log(result);
      return result.map(imgSubArray => {
        return {
          main: imgSubArray[0],
          mediumThumbnail: imgSubArray[1],
          smallThumbnail: imgSubArray[2],
        };
      });
    })
    .then(resolve)
    .catch(reject);
  });
};

Parse.Cloud.beforeSave('Product', async (req, res) => {
  const product = req.object;
  const images = product.get('images') || null;
  // const imagesUpdated = await updateImagesArray(images);

  let imagesUpdated;
  try {
    imagesUpdated = await updateImagesArray(images);
  } catch (error) {
    return res.error(error.message);
  }
  product.set('images', imagesUpdated);

  return res.success();
});
