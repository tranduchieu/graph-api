/* global Parse, @flow */
import url from 'url';
import path from 'path';
import Promise from 'bluebird';

import latenize from '../services/latenize';
import loaders from '../graphql/loaders';

// const masterkey = process.env.MASTER_KEY || '';
// const SERVER_PORT = process.env.PORT || 8080;
// const SERVER_HOST = process.env.HOST || 'localhost';
// const GraphQLurl = `http://${SERVER_HOST}:${SERVER_PORT}/graphql`;

const bucket = process.env.S3_BUCKET || 'ecolab-server';
const bucketPrefix = process.env.S3_BUCKET_PREFIX || '';
const s3Host = `${bucket}.s3.amazonaws.com`;

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

const checkcode = (code) => {
  return new Promise((resolve, reject) => {
    if (!code) return reject(new Error('Vui lòng nhập code'));

    const Product = Parse.Object.extend('Product');
    const query = new Parse.Query(Product);
    query.equalTo('code', code);
    return query.first({ useMasterKey: true })
      .then(productObj => {
        if (!productObj) return resolve(true);
        return reject(new Error(`code ${code} đã tồn tại`));
      })
      .catch(reject);
  });
};

Parse.Cloud.beforeSave('Product', async (req, res) => {
  const product = req.object;
  const name = product.get('name') || null;
  const description = product.get('description') || null;
  let currentProduct;

  if (product.id) {
    const Product = Parse.Object.extend('Product');
    const productQuery = new Parse.Query(Product);
    currentProduct = await productQuery.get(product.id, { useMasterKey: true });
  }

  // Check required fields
  if (!currentProduct && !product.get('code')) return res.error('code is required');
  if (!currentProduct && !product.get('shop')) return res.error('shop is required');
  if (!currentProduct && !product.get('status')) return res.error('status is required');
  if (!currentProduct && !product.get('price')) return res.error('price is required');

  // Xử lý ảnh
  const images = product.get('images') || null;

  // Check code
  let checkcodePromise = Promise.resolve();
  const code = product.get('code') || null;
  if (!currentProduct || (currentProduct && currentProduct.get('code') !== code)) {
    checkcodePromise = checkcode(code);
  }

  // Run all Promises
  const [imagesUpdated] = await Promise.all([
    updateImagesArray(images),
    checkcodePromise,
  ])
  .catch(error => {
    return res.error(error.message);
  });
  product.set('images', imagesUpdated);

  // Set nameToWords
  let nameToWords = [];
  if (name) {
    nameToWords = latenize(name)
                  .replace(/[^\w\s]/gi, '')
                  .replace(/\u000b/g, '')
                  .toLowerCase()
                  .match(/[^ ]+/g);
  }
  product.set('nameToWords', nameToWords);

  // Set descriptionToWords
  let descriptionToWords = [];
  if (description) {
    descriptionToWords = latenize(description)
                        .replace(/[^\w\s]/gi, '')
                        .replace(/\u000b/g, '')
                        .toLowerCase()
                        .match(/[^ ]+/g);
  }
  product.set('descriptionToWords', descriptionToWords);

  // Set other fields
  product.set('additionalPrices', product.get('additionalPrices') || []);
  product.set('boxes', product.get('boxes') || []);
  product.set('tags', product.get('tags') || []);
  product.set('additionalProperties', product.get('additionalProperties') || []);
  product.set('featured', product.get('featured') || false);

  return res.success();
});

// After Save triggers
// ======================================
// - Create boxes
// - Create tags

const createBoxes = (boxes: string[]): Promise<Object[]> => {
  return Promise.map(boxes, box => {
    const Box = Parse.Object.extend('Box');
    const newBox = new Box();
    newBox.set('name', box);
    newBox.set('type', 'product');
    newBox.set('visible', true);
    return newBox.save(null, { useMasterKey: true });
  });
};

const createTags = (tags: string[]): Promise<Object[]> => {
  return Promise.map(tags, tag => {
    const ProductTag = Parse.Object.extend('ProductTag');
    const newTag = new ProductTag();
    newTag.set('name', tag);
    return newTag.save(null, { useMasterKey: true });
  });
};

// const createBoxes = (boxes: string[]): Promise<Object[]> => {
//   const createBoxesPromise = boxes.map(box => {
//     return Parse.Cloud.httpRequest({
//       method: 'POST',
//       url: GraphQLurl,
//       headers: {
//         masterkey,
//       },
//       params: {
//         query: `mutation CreateBoxMutation($input: BoxCreateInput!) {
//           createBox(input: $input) {
//             boxEdge {
//               node {
//                 id
//                 name
//                 description
//                 featured
//               }
//             }
//           }
//         }`,
//         operationName: 'CreateBoxMutation',
//         variables: `{
//           "input": {
//             "name": "${box}",
//             "type": "PRODUCT",
//             "clientMutationId": "abc"
//           }
//         }`,
//       },
//     });
//   });
//   return Promise.all(createBoxesPromise);
// };

// const createTags = (tags: string[]): Promise<Object[]> => {
//   const createTagsPromise = tags.map(tag => {
//     return Parse.Cloud.httpRequest({
//       method: 'POST',
//       url: GraphQLurl,
//       headers: {
//         masterkey,
//       },
//       params: {
//         query: `mutation CreateProductTagMutation($input: ProductTagCreateInput!) {
//           createProductTag(input: $input) {
//             productTagEdge {
//               node {
//                 id
//                 name
//                 description
//               }
//             }
//           }
//         }`,
//         operationName: 'CreateProductTagMutation',
//         variables: `{
//           "input": {
//             "name": "${tag}",
//             "clientMutationId": "abc"
//           }
//         }`,
//       },
//     });
//   });
//   return Promise.all(createTagsPromise);
// };

Parse.Cloud.afterSave('Product', (req, res) => {
  const product = req.object;
  const boxes: string[] = product.get('boxes');
  const tags: string[] = product.get('tags');

  Promise.all([
    createBoxes(boxes),
    createTags(tags),
  ]);

  // Clear loaders
  loaders.product.prime(product.id, product);
  loaders.products.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  return res.success();
});

Parse.Cloud.afterDelete('Product', (req, res) => {
  const product = req.object;

  // Clear loaders
  loaders.product.clear(product.id);
  loaders.products.clearAll();
  loaders.searchs.clearAll();
  loaders.searchsCount.clearAll();

  res.success();
});

