import csvParse from 'csv-parse';
import { readFile } from 'fs';
import path from 'path';
import Parse from 'parse/node';
import nodeUUID from 'node-uuid';
import Promise from 'bluebird';

// import latenize from '../latenize';

const file = path.join(__dirname, '../../data/files/tocu_kh_30_09_2016_checked.csv');

readFile(file, 'utf8', (err, data) => {
  if (err) console.log(err);

  csvParse(data, { comment: '#' }, (err2, output) => {
    if (err2) console.log(err2);
    Promise.map(output, line => {
      const inputObj = {
        fmId: line[0],
        name: line[1],
        mobilePhone: line[2],
        note: line[4],
        username: nodeUUID.v4(),
        password: nodeUUID.v4(),
        email: `${nodeUUID.v4()}@fakemail.com`,
      };

      // const mobilePhoneRegex = /^(091|094|0123|0124|0125|0127|0129|088|090|093|0120|0121|0122|0126|0128|089|098|097|096|0169|0168|0167|0166|0165|0164|0163|0162|086|092|0186|0188|0199|099|0993|0994|0995|0996|095)\d{7}$/;

      // const testMobilePhone = new RegExp(mobilePhoneRegex).test(inputObj.mobilePhone);
      // if (testMobilePhone === false) {
      //   inputObj.error = 'Số điện thoại không đúng định dạng';
      //   const FailedUser = Parse.Object.extend('FailedUser');
      //   const newFailedUser = new FailedUser();
      //   return newFailedUser.save(inputObj, { useMasterKey: true });
      // }

      const newUser = new Parse.User();
      return newUser.save(inputObj, { useMasterKey: true })
      .catch(error => {
        inputObj.error = error.message;
        const FailedUser = Parse.Object.extend('FailedUser');
        const newFailedUser = new FailedUser();
        return newFailedUser.save(inputObj, { useMasterKey: true });
      });
    }, { concurrency: 5 });
  });
});


// const nameToWords = "Trần Ngọc Đức".match(/[^ ]+/g).map(item => {
//   return latenize(item).toLowerCase().replace(/[^\w\s]/gi, '').replace(/\u000b/g, '');
// });

// console.log(nameToWords);
