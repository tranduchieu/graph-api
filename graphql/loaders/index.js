import {
  allUserLoader,
  userByIdLoader,
} from './user';

import {
  allProfilesLoader,
  profileByIdLoader,
} from './profile';

module.exports = {
  users: allUserLoader,
  user: userByIdLoader,
  profiles: allProfilesLoader,
  profile: profileByIdLoader,
};
