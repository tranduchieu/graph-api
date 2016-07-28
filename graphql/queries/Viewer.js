import ViewerType from '../types/viewer';

export default {
  viewer: {
    type: ViewerType,
    resolve(_) {
      console.log(_);
      return _;
    },
  },
};
