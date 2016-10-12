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


export const searchsLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { text, type, skip, limit } = args;

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
    .skip(skip)
    .limit(limit)
    .find({ useMasterKey: true })
    .then(data => {
      console.log(data);
      if (data.length >= 1) {
        data.forEach(item => {
          loaderById.prime(item.id, item);
        });
      }

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
