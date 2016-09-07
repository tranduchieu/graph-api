// import Parse from 'parse/node';

// // Query roles by user
// // --------------------------------------------
// const queryUser = new Parse.Query(Parse.User);
// queryUser.equalTo('username', 'tranduchieu');
// queryUser.first()
//   .then(user => {
//     const roleQuery = new Parse.Query(Parse.Role);
//     roleQuery.equalTo('users', user);
//     roleQuery.include('roles');
//     roleQuery.find()
//     .then(roleObj => console.log(roleObj[0].get('roles')))
//     .catch(console.error);
//   })
//   .catch(console.error);
