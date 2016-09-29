import {
  GraphQLEnumType,
} from 'graphql';

export const ShopEnumType = new GraphQLEnumType({
  name: 'ShopEnumType',
  values: {
    TO_CU: {
      value: 'Tổ Cú',
    },
    HOANG_QUOC_VIET: {
      value: 'Tổ Cú Hoàng Quốc Việt',
    },
    MINH_KHAI: {
      value: 'Tổ Cú Minh Khai',
    },
    NGUYEN_TRAI: {
      value: 'Tổ Cú Nguyễn Trãi',
    },
    ONLINE: {
      value: 'Tổ Cú Online',
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

export const OrderStatusEnum = new GraphQLEnumType({
  name: 'OrderStatusEnum',
  values: {
    PENDING: {
      value: 'pending',
      description: 'Chờ thanh toán',
    },
    PARTIALLY_PAID: {
      value: 'partiallyPaid',
      description: 'Thanh toán một phần',
    },
    PAID: {
      value: 'paid',
      description: 'Đã thanh toán',
    },
    SENDING: {
      value: 'sending',
      description: 'Đang gửi hàng',
    },
    COMPLETED: {
      value: 'completed',
      description: 'Đã hoàn thành',
    },
    FAILED: {
      value: 'failed',
      description: 'Thất bại',
    },
    CANCELED: {
      value: 'canceled',
      description: 'Đã hủy',
    },
  },
});

export const BoxTypesEnum = new GraphQLEnumType({
  name: 'BoxTypesEnum',
  values: {
    PRODUCT: {
      value: 'product',
      description: 'Box dạng Sản phẩm',
    },
    ARTICLE: {
      value: 'article',
      description: 'Box dạng Bài viết',
    },
    PHOTO: {
      value: 'photo',
      description: 'Box dạng Ảnh',
    },
  },
});
