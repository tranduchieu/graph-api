import {
  GraphQLEnumType,
} from 'graphql';

export const ShopEnumType = new GraphQLEnumType({
  name: 'ShopEnumType',
  values: {
    HOANG_QUOC_VIET: {
      value: 'Tổ Cú Hoàng Quốc Việt',
    },
    MINH_KHAI: {
      value: 'Tổ Cú Minh Khai',
    },
    NGUYEN_TRAI: {
      value: 'Tổ Cú Nguyễn Trãi',
    },
  },
});

export const ProductStatusEnum = new GraphQLEnumType({
  name: 'ProductStatusEnumType',
  values: {
    DRAFT: {
      value: 'draft',
      description: 'Sản phẩm lưu dạng nháp. Chưa public.',
    },
    AVAILABLE_IN_STORE: {
      value: 'availableInStore',
      description: 'Sản phẩm chỉ bán ở cửa hàng',
    },
    AVAILABLE_IN_ONLINE: {
      value: 'availableInOnline',
      description: 'Sản phẩm chỉ bán Online',
    },
    AVAILABLE_IN_ALL: {
      value: 'availableInAll',
      description: 'Sản phẩm bán cả on & off',
    },
    SUSPENDED: {
      value: 'suspended',
      description: 'Sản phẩm đang treo',
    },
    SOLD: {
      value: 'sold',
      description: 'Sản phẩm đã bán',
    },
    CLOSED: {
      value: 'closed',
      description: 'Sản phẩm đã đóng',
    },
  },
});
