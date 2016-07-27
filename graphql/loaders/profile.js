import DataLoader from 'dataloader';
import Parse from 'parse/node';

export const profileByIdLoader = new DataLoader(ids => {
  const Profile = Parse.Object.extend('Profile');
  const queryProfile = new Parse.Query(Profile);
  queryProfile.containedIn('objectId', ids);
  return queryProfile.find();
});

export const allProfileLoader = new DataLoader(keys => {
  const Profile = Parse.Object.extend('Profile');
  const queryProfile = new Parse.Query(Profile);

  if (keys[0] !== 'allProfiles' && typeof JSON.parse(keys[0]) === 'object') {
    const argObj = JSON.parse(keys[0]);
    Object.keys(argObj).forEach(key => {
      queryProfile.equalTo(key, argObj.key);
    });
  }

  return queryProfile.find();
});
