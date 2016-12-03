import _ from 'lodash';
import Parse from 'parse/node';

const ALPHABET = '23456789abdegjkmnpqrvwxyz';
const ALPHABET_LENGTH = ALPHABET.length;
const ID_LENGTH = 6;

function generateId() {
  let rtn = '';
  for (let i = 0; i < ID_LENGTH; i += 1) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET_LENGTH));
  }
  rtn = [rtn.slice(0, 3), '-', rtn.slice(3)].join('');
  return rtn;
}

async function checkUniqueAndCreate(id) {
  const query = new Parse.Query('ShortId');
  query.equalTo('shortId', id);
  const shortIdObj = await query.first({ useMasterKey: true });

  if (shortIdObj) throw new Error('shortId đã tồn tại');
  const ShortId = Parse.Object.extend('ShortId');
  const shortId = new ShortId();
  shortId.set('shortId', id);
  shortId.set('used', false);
  return shortId.save();
}

export function batchAdd(times) {
  return _.times(times, async () => {
    let duplicate = true;

    do {
      const id = generateId();
      let checkUnique;
      try {
        checkUnique = await checkUniqueAndCreate(id);
        duplicate = false;
        console.log(checkUnique);
      } catch (error) {
        console.error(error);
      }
    }
    while (duplicate === true);
  });
}

export async function getOne(): Promise {
  const ShortId = Parse.Object.extend('ShortId');
  const query = new Parse.Query(ShortId);
  query.equalTo('used', false);
  const shortIdClass = await query.first({ useMasterKey: true });
  if (!shortIdClass) throw new Error('Không tìm thấy shortId nào còn khả dụng');
  const id = shortIdClass.get('shortId');

  // Set là đã dùng
  shortIdClass.set('used', true);
  await shortIdClass.save(null, { useMasterKey: true });

  return id;
}

function availableCount(): Promise {
  const ShortId = Parse.Object.extend('ShortId');
  const query = new Parse.Query(ShortId);
  query.equalTo('used', false);
  return query.count();
}

function usedCount(): Promise {
  const ShortId = Parse.Object.extend('ShortId');
  const query = new Parse.Query(ShortId);
  query.equalTo('used', true);
  return query.count();
}

export function status(): Promise {
  return Promise.all([
    availableCount(),
    usedCount(),
  ])
  .then(([available, used]) => {
    return { available, used };
  });
}
