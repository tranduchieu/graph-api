import {
  allUserLoader,
  userByIDLoader
} from './user';

export default {
  users: allUserLoader,
  user: userByIDLoader
};
