import ViewerType from '../types/viewer';

export default {
  viewer: {
    type: ViewerType,
    resolve(_) {
      return _;
    },
  },
};
