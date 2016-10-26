// @flow
import DataLoader from 'dataloader';
import Parse from 'parse/node';
import latenize from '../../services/latenize';
import { productByIdLoader } from './product';
import { userByIdLoader } from './user';
import { orderByIdLoader } from './order';

// Search in User class
// [x] Search containsAll nameToWords
// [x] Search startsWith username
// [x] Search startsWith mobilePhone
const searchUserQuery = (searchText: string) => {
  let splitWords = [];
  splitWords = latenize(searchText)
              .replace(/[^\w\s]/gi, '')
              .replace(/\u000b/g, '')
              .toLowerCase()
              .match(/[^ ]+/g);

  const queryNameToWords = new Parse.Query(Parse.User);
  queryNameToWords.containsAll('nameToWords', splitWords);

  const queryUserName = new Parse.Query(Parse.User);
  queryUserName.startsWith('username', searchText);

  const queryMobilePhone = new Parse.Query(Parse.User);
  queryMobilePhone.startsWith('mobilePhone', searchText);

  const mainQuery = Parse.Query.or(queryNameToWords, queryUserName, queryMobilePhone);
  return mainQuery;
};

// Search in Product class
// [x] Search startsWith code
// [x] Search containsAll nameToWords
// [x] Search containsAll descriptionToWords
const searchProductQuery = (searchText: string) => {
  const queryCode = new Parse.Query('Product');
  queryCode.startsWith('code', searchText);

  let splitWords = [];
  splitWords = latenize(searchText)
              .replace(/[^\w\s]/gi, '')
              .replace(/\u000b/g, '')
              .toLowerCase()
              .match(/[^ ]+/g);

  const queryNameToWords = new Parse.Query('Product');
  queryNameToWords.containsAll('nameToWords', splitWords);

  const queryDescription = new Parse.Query('Product');
  queryDescription.containsAll('descriptionToWords', splitWords);

  const mainQuery = Parse.Query.or(queryCode, queryNameToWords, queryDescription);
  return mainQuery;
};

// Search in Order class
// [x] Search startsWith code
const searchOrderQuery = (searchText: string) => {
  const query = new Parse.Query('Product');
  query.startsWith('code', searchText);

  return query;
};

const calcSkipLimit = (types, typesRatio, skip, limit, totalCounts) => {
  // Calc limit array
  const limitArray = typesRatio.map(item => {
    const typeLimit = Math.round((limit * item) / 100);
    return typeLimit;
  });
  let totalLimit = limitArray.reduce((a, b) => {
    return a + b;
  }, 0);
  while (totalLimit > limit) {
    let i = 0;
    while (i < typesRatio.length) {
      if ((((limit * typesRatio[i]) / 100) % 1) >= 0.5) {
        limitArray[i] -= 1;
        totalLimit = limitArray.reduce((a, b) => {
          return a + b;
        }, 0);
        break;
      }
      i += 1;
    }
  }
  while (totalLimit < limit) {
    let i = 0;
    while (i < typesRatio.length) {
      if ((((limit * typesRatio[i]) / 100) % 1) < 0.5) {
        limitArray[i] += 1;
        totalLimit = limitArray.reduce((a, b) => {
          return a + b;
        }, 0);
        break;
      }
      i += 1;
    }
  }
  // Calc skip array
  const skipArray = typesRatio.map(item => {
    const typeSkip = Math.round((skip * item) / 100);
    return typeSkip;
  });
  let totalSkip = skipArray.reduce((a, b) => {
    return a + b;
  }, 0);
  while (totalSkip > skip) {
    let i = 0;
    while (i < typesRatio.length) {
      if ((((skip * typesRatio[i]) / 100) % 1) >= 0.5) {
        skipArray[i] -= 1;
        totalSkip = skipArray.reduce((a, b) => {
          return a + b;
        }, 0);
        break;
      }
      i += 1;
    }
  }
  while (totalSkip < skip) {
    let i = 0;
    while (i < typesRatio.length) {
      if ((((skip * typesRatio[i]) / 100) % 1) < 0.5) {
        skipArray[i] += 1;
        totalSkip = skipArray.reduce((a, b) => {
          return a + b;
        }, 0);
        break;
      }
      i += 1;
    }
  }

  // Những cái còn thiếu
  const typesLessThan = []; // Số Type mà (skip + limit) < totalCount
  let typesLessThanRatio = 0; // Tổng số phần trăm những type (skip + limit) < totalCount
  let typesLessThanItems = 0; // Tổng số items cần get thêm

  // Những cái sẽ hỗ trợ get thêm
  const typesGreaterThan = [];
  const ratioOfTypesGreaterThan = [];

  for (let i = 0; i < types.length; i += 1) {
    const type = types[i];
    const skipType = skipArray[i];
    const limitType = limitArray[i];
    const ratio = typesRatio[i];
    const totalCount = totalCounts[i];

    if ((skipType + limitType) > totalCount) {
      typesLessThan.push(limitType);
      typesLessThanRatio += ratio;
      typesLessThanItems += limitType;
    }

    if ((skipType + limitType) <= totalCount) {
      typesGreaterThan.push(type);
      ratioOfTypesGreaterThan.push(ratio);
    }
  }

  // Duyệt mảng GreaterThan
  if (typesGreaterThan.length > 0) {
    const typesGetMore = [];
    for (let i = 0; i < typesGreaterThan.length; i += 1) {
      const getMore = Math.round(((typesLessThanRatio / typesGreaterThan.length) + ratioOfTypesGreaterThan[i]) / (100 * typesLessThanItems));
      typesGetMore.push(getMore);
    }

    let totalGetMore = typesGetMore.reduce((a, b) => {
      return a + b;
    }, 0);

    while (totalGetMore > typesLessThanItems) {
      let i = 0;
      while (i < typesGetMore.length) {
        if (((((typesLessThanRatio / typesGreaterThan.length) + ratioOfTypesGreaterThan[i]) / (100 * typesLessThanItems)) % 1) >= 0.5) {
          typesGetMore[i] -= 1;
          totalGetMore = typesGetMore.reduce((a, b) => {
            return a + b;
          }, 0);
          break;
        }
        i += 1;
      }
    }
    while (totalGetMore < typesLessThanItems) {
      let i = 0;
      while (i < typesGetMore.length) {
        if (((((typesLessThanRatio / typesGreaterThan.length) + ratioOfTypesGreaterThan[i]) / (100 * typesLessThanItems)) % 1) < 0.5) {
          typesGetMore[i] += 1;
          totalGetMore = typesGetMore.reduce((a, b) => {
            return a + b;
          }, 0);
          break;
        }
        i += 1;
      }
    }

    // Cộng thêm vào mảng limit
    for (let i = 0; i < types.length; i += 1) {
      for (let j = 0; j < typesGreaterThan.length; j += 1) {
        if (types[i] === typesGreaterThan[j]) {
          limitArray[i] += typesGetMore[j];
        }
      }
    }
  }

  return {
    types,
    skips: skipArray,
    limits: limitArray,
  };
};

const queryByType = (type: string, text: string, skip: number, limit: number) => {
  let searchQuery;
  let loaderById;

  switch (type) {
    case 'user':
      searchQuery = searchUserQuery;
      loaderById = userByIdLoader;
      break;
    case 'order':
      searchQuery = searchOrderQuery;
      loaderById = orderByIdLoader;
      break;
    default:
      searchQuery = searchProductQuery;
      loaderById = productByIdLoader;
  }

  return searchQuery(text)
  .descending('createdAt')
  .skip(skip)
  .limit(limit)
  .find({ useMasterKey: true })
  .then(data => {
    if (data.length >= 1) {
      data.forEach(item => {
        loaderById.prime(item.id, item);
      });
    }

    return data;
  });
};

export const searchsLoader = new DataLoader(keys => {
  return Promise.all(keys.map(async key => {
    const args = JSON.parse(key);
    const { text, skip, limit } = args;
    let { types, ratio } = args;

    if (types.length === 1) {
      return queryByType(types[0], text, skip, limit);
    }

    const totalCountPromises = [];
    const searchQueryPromises = [];

    if (types.length === 0) {
      types = ['user', 'product', 'order'];
      ratio = [30, 40, 30];
    }

    for (let i = 0; i < types.length; i += 1) {
      totalCountPromises.push(searchsCountLoader.load(JSON.stringify({
        text,
        type: types[i],
      })));
    }

    const totalCounts = await Promise.all(totalCountPromises);

    const calc = calcSkipLimit(types, ratio, skip, limit, totalCounts);

    if (skip > 0) {
      const calcBefore = calcSkipLimit(types, ratio, skip - limit > 0 ? skip - limit : 0, limit, totalCounts);

      for (let i = 0; i < types.length; i += 1) {
        if ((calcBefore.skips[i] + calcBefore.limits[i]) > calc.skips[i]) {
          calc.skips[i] = calcBefore.skips[i] + calcBefore.limits[i];
        }
      }
    }

    for (let i = 0; i < types.length; i += 1) {
      searchQueryPromises.push(queryByType(
        calc.types[i],
        text,
        calc.skips[i],
        calc.limits[i],
      ));
    }

    return Promise.all(searchQueryPromises)
    .then(result => {
      const data = [];
      result.forEach(resultByType => {
        return Array.prototype.push.apply(data, resultByType);
      });

      return data;
    });
  }));
});

export const searchsCountLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { text, type } = args;

    let searchQuery;

    switch (type) {
      case 'user':
        searchQuery = searchUserQuery;
        break;
      case 'order':
        searchQuery = searchOrderQuery;
        break;
      default:
        searchQuery = searchProductQuery;
    }

    return searchQuery(text)
    .count({ useMasterKey: true });
  }));
});
