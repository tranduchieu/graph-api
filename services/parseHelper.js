import Parse from 'parse/node';

export const deleteToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = new Parse.Query(Parse.Session);
    query.equalTo('sessionToken', token);
    return query.first({ useMasterKey: true })
      .then(sessionClass => {
        if (!sessionClass) return resolve('sessionToken không tồn tại');
        return sessionClass.destroy({ useMasterKey: true });
      })
      .then(() => {
        return resolve('sessionToken đã được xóa');
      })
      .catch(reject);
  });
};

export const handleParseError = (err) => {
  console.log(err);
  // switch (err.code) {
  //   case Parse.Error.INVALID_SESSION_TOKEN:
  //     Parse.User.logOut();
  //     break;
  // }
};
