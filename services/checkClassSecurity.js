import axios from 'axios';

const SERVER_PORT = process.env.PORT || 8080;
const PARSE_URL = `http://localhost:${SERVER_PORT}/parse`;
const APP_ID = process.env.APP_ID;
const MASTER_KEY = process.env.MASTER_KEY;

const checkClassSecurity = (className, userId) => {
  return new Promise((resolve, reject) => {
    return axios({
      url: `${PARSE_URL}/schemas/${className}`,
      method: 'get',
      headers: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-Master-Key': MASTER_KEY,
      },
    })
    .then(res => {
      const { classLevelPermissions } = res.data;
      const { create } = classLevelPermissions;

      let userPermissionStatus = false;
      Object.keys(create).forEach(key => {
        if (key === userId) {
          userPermissionStatus = true;
        }
      });

      if (userPermissionStatus === true) return resolve();
      return reject();
    })
    .catch(reject);
  });
};

checkClassSecurity('Product', 'xxx')
.then(console.log)
.catch(console.error);
