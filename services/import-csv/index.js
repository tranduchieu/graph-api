import csvParse from 'csv-parse';
import { readFile } from 'fs';
import path from 'path';
import Parse from 'parse/node';
import nodeUUID from 'node-uuid';

// import latenize from '../latenize';

const file = path.join(__dirname, 'tocu_kh_30_09_2017.csv');

readFile(file, 'utf8', (err, data) => {
  if (err) console.log(err);

  csvParse(data, { comment: '#' }, (err2, output) => {
    if (err2) console.log(err2);
    console.log(output);
    output.forEach(line => {
      const newUser = new Parse.User();
      newUser.set('fmId', line[0]);
      newUser.set('name', line[1]);
      newUser.set('mobilePhone', line[2]);
      newUser.set('note', line[4]);
      newUser.set('username', nodeUUID.v4());
      newUser.set('password', nodeUUID.v4());
      newUser.set('email', `${nodeUUID.v4()}@fakemail.com`);
      return newUser.save(null, { useMasterKey: true })
      .then(console.log)
      .catch(console.error);
    });
  });
});


// const nameToWords = "Trần Ngọc Đức".match(/[^ ]+/g).map(item => {
//   return latenize(item).toLowerCase().replace(/[^\w\s]/gi, '').replace(/\u000b/g, '');
// });

// console.log(nameToWords);
