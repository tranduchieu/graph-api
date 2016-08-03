import DataLoader from 'dataloader';
import Parse from 'parse/node';
import { cursorToOffset } from 'graphql-relay';

export const profileByIdLoader = new DataLoader(ids => {
  const Profile = Parse.Object.extend('Profile');
  const queryProfile = new Parse.Query(Profile);
  queryProfile.containedIn('objectId', ids);
  return queryProfile.find()
    .then(profiles => {
      return ids.map(id => {
        const profileFilter = profiles.filter(profile => {
          return profile.id === id;
        });

        const result = profileFilter.length >= 1 ? profileFilter[0] : null;
        return result;
      });
    });
});

export const allProfilesLoader = new DataLoader(keys => {
  return Promise.all(keys.map(key => {
    const args = JSON.parse(key);
    const { after, first, mobilePhone } = args;

    const Profile = Parse.Object.extend('Profile');
    const queryProfile = new Parse.Query(Profile);
    if (mobilePhone) queryProfile.equalTo('mobilePhone', mobilePhone);
    queryProfile.skip(after ? cursorToOffset(after) + 1 : 0);
    queryProfile.limit(first || 20);

    return queryProfile.find()
      .then(profiles => {
        profiles.forEach(item => {
          profileByIdLoader.prime(item.id, item);
        });
        return profiles;
      });
  }));
});
