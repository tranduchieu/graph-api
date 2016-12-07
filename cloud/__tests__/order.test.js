import Parse from 'parse/node';
import * as orderCloud from '../order';

describe('Test order cloud functions', () => {
  beforeEach(() => {
    Parse.initialize(process.env.APP_ID);
    Parse.serverURL = `http://localhost:${process.env.PORT}/parse`;
    Parse.masterKey = process.env.MASTER_KEY;
  });
  describe('checkCode', () => {
    test('trả về promise resolve true', async () => {
      const check = await orderCloud.checkCode('xxx');
      expect(check).toEqual(true);
    });
    test('báo lỗi nếu code đã tồn tại', async () => {
      try {
        await orderCloud.checkCode('8dj-cx1');
      } catch (error) {
        return expect(error.message).toEqual('Code 8dj-cx1 đã tồn tại');
      }
      return true;
    });
  });
  describe('Tính toán lại hóa đơn', () => {
    test('Tính toán hóa đơn đúng trả về resolve true', async () => {
      const orderJSON = {
        lines: [{ productId: 'jYx0chCLWA',
        unitPrice: 410000,
        quantity: 1,
        amount: 410000,
        weight: 900,
        boxes: [Object],
        tags: [],
        productName: null }],
        code: '8dj-cx1',
        shop: 'Tổ Cú Hoàng Quốc Việt',
        customer: { __type: 'Pointer', className: '_User', objectId: 'wecfUbP19z' },
        shippingCost: 0,
        shippingDays: 0,
        status: 'partiallyPaid',
        subTotal: 410000,
        percentageDiscount: 0,
        fixedDiscount: 0,
        totalDiscounts: 0,
        total: 410000,
        totalWeight: 900,
        note: 'updated by function 1111',
        createdAt: '2016-12-02T11:59:18.474Z',
        updatedAt: '2016-12-06T06:03:38.787Z',
        objectId: 'yr8WI8krbD',
      };
      const result = await orderCloud.reCalculateOrder(orderJSON);
      expect(result).toEqual(true);
    });
    test('Order line amount không đúng', async () => {
      const orderJSON = {
        lines: [{ productId: 'jYx0chCLWA',
        unitPrice: 410000,
        quantity: 2,
        amount: 410000,
        weight: 900,
        boxes: [Object],
        tags: [],
        productName: null }],
        code: '8dj-cx1',
        shop: 'Tổ Cú Hoàng Quốc Việt',
        customer: { __type: 'Pointer', className: '_User', objectId: 'wecfUbP19z' },
        shippingCost: 0,
        shippingDays: 0,
        status: 'partiallyPaid',
        subTotal: 410000,
        percentageDiscount: 0,
        fixedDiscount: 0,
        totalDiscounts: 0,
        total: 410000,
        totalWeight: 900,
        note: 'updated by function 1111',
        createdAt: '2016-12-02T11:59:18.474Z',
        updatedAt: '2016-12-06T06:03:38.787Z',
        objectId: 'yr8WI8krbD',
      };
      try {
        await orderCloud.reCalculateOrder(orderJSON);
      } catch (error) {
        return expect(error.message).toEqual('OrderLine amount không đúng');
      }
      return true;
    });
    test('Order subTotal không đúng', async () => {
      const orderJSON = {
        lines: [{ productId: 'jYx0chCLWA',
        unitPrice: 410000,
        quantity: 1,
        amount: 410000,
        weight: 900,
        boxes: [Object],
        tags: [],
        productName: null }],
        code: '8dj-cx1',
        shop: 'Tổ Cú Hoàng Quốc Việt',
        customer: { __type: 'Pointer', className: '_User', objectId: 'wecfUbP19z' },
        shippingCost: 0,
        shippingDays: 0,
        status: 'partiallyPaid',
        subTotal: 420000,
        percentageDiscount: 0,
        fixedDiscount: 0,
        totalDiscounts: 0,
        total: 410000,
        totalWeight: 900,
        note: 'updated by function 1111',
        createdAt: '2016-12-02T11:59:18.474Z',
        updatedAt: '2016-12-06T06:03:38.787Z',
        objectId: 'yr8WI8krbD',
      };
      try {
        await orderCloud.reCalculateOrder(orderJSON);
      } catch (error) {
        return expect(error.message).toEqual('subTotal không đúng');
      }
      return true;
    });
    test('Order totalDiscounts không đúng', async () => {
      const orderJSON = {
        lines: [{ productId: 'jYx0chCLWA',
        unitPrice: 410000,
        quantity: 1,
        amount: 410000,
        weight: 900,
        boxes: [Object],
        tags: [],
        productName: null }],
        code: '8dj-cx1',
        shop: 'Tổ Cú Hoàng Quốc Việt',
        customer: { __type: 'Pointer', className: '_User', objectId: 'wecfUbP19z' },
        shippingCost: 0,
        shippingDays: 0,
        status: 'partiallyPaid',
        subTotal: 410000,
        percentageDiscount: 10,
        fixedDiscount: 0,
        totalDiscounts: 40000,
        total: 410000,
        totalWeight: 900,
        note: 'updated by function 1111',
        createdAt: '2016-12-02T11:59:18.474Z',
        updatedAt: '2016-12-06T06:03:38.787Z',
        objectId: 'yr8WI8krbD',
      };
      try {
        await orderCloud.reCalculateOrder(orderJSON);
      } catch (error) {
        return expect(error.message).toEqual('totalDiscounts không đúng');
      }
      return true;
    });
    test('Order total không đúng', async () => {
      const orderJSON = {
        lines: [{ productId: 'jYx0chCLWA',
        unitPrice: 410000,
        quantity: 1,
        amount: 410000,
        weight: 900,
        boxes: [Object],
        tags: [],
        productName: null }],
        code: '8dj-cx1',
        shop: 'Tổ Cú Hoàng Quốc Việt',
        customer: { __type: 'Pointer', className: '_User', objectId: 'wecfUbP19z' },
        shippingCost: 0,
        shippingDays: 0,
        status: 'partiallyPaid',
        subTotal: 410000,
        percentageDiscount: 10,
        fixedDiscount: 0,
        totalDiscounts: 41000,
        total: 410000,
        totalWeight: 900,
        note: 'updated by function 1111',
        createdAt: '2016-12-02T11:59:18.474Z',
        updatedAt: '2016-12-06T06:03:38.787Z',
        objectId: 'yr8WI8krbD',
      };
      try {
        await orderCloud.reCalculateOrder(orderJSON);
      } catch (error) {
        return expect(error.message).toEqual('total không đúng');
      }
      return true;
    });
  });

  describe('checkProductStatus', () => {
    test('Product status not available for order', async () => {
      const productJSON = { boxes: ['Áo phông nam', 'Giầy'],
      images: [],
      description: 'Quan vayyyy',
      code: 'jfh-76i',
      shop: 'Tổ Cú Hoàng Quốc Việt',
      status: 'sold',
      featured: false,
      price: 120000,
      updatedBy: { __type: 'Pointer', className: '_User', objectId: '2eN0hIjiqu' },
      createdBy: { __type: 'Pointer', className: '_User', objectId: '2eN0hIjiqu' },
      createdAt: '2016-09-30T11:20:13.522Z',
      updatedAt: '2016-12-02T12:04:56.245Z',
      nameToWords: [],
      descriptionToWords: ['quan', 'vayyyy'],
      additionalPrices: [],
      tags: [],
      additionalProperties: [],
      ACL: { '*': { read: true } },
      objectId: 'jYx0chCLWA' };

      try {
        await orderCloud.checkProductStatus(productJSON, 'Tổ Cú Hoàng Quốc Việt');
      } catch (error) {
        return expect(error.message).toEqual('Product jYx0chCLWA status is sold, not available for order');
      }
      return true;
    });
    test('Product not in store, not available for order', async () => {
      const productJSON = { boxes: ['Áo phông nam', 'Giầy'],
      images: [],
      description: 'Quan vayyyy',
      code: 'jfh-76i',
      shop: 'Tổ Cú Hoàng Quốc Việt',
      status: 'availableInStore',
      featured: false,
      price: 120000,
      updatedBy: { __type: 'Pointer', className: '_User', objectId: '2eN0hIjiqu' },
      createdBy: { __type: 'Pointer', className: '_User', objectId: '2eN0hIjiqu' },
      createdAt: '2016-09-30T11:20:13.522Z',
      updatedAt: '2016-12-02T12:04:56.245Z',
      nameToWords: [],
      descriptionToWords: ['quan', 'vayyyy'],
      additionalPrices: [],
      tags: [],
      additionalProperties: [],
      ACL: { '*': { read: true } },
      objectId: 'jYx0chCLWA' };

      try {
        await orderCloud.checkProductStatus(productJSON, 'Tổ Cú Minh Khai');
      } catch (error) {
        return expect(error.message).toEqual('Sản phẩm jfh-76i đang ở shop Tổ Cú Hoàng Quốc Việt');
      }
      return true;
    });
    test('Product available for order', async () => {
      const productJSON = { boxes: ['Áo phông nam', 'Giầy'],
      images: [],
      description: 'Quan vayyyy',
      code: 'jfh-76i',
      shop: 'Tổ Cú Hoàng Quốc Việt',
      status: 'availableInStore',
      featured: false,
      price: 120000,
      updatedBy: { __type: 'Pointer', className: '_User', objectId: '2eN0hIjiqu' },
      createdBy: { __type: 'Pointer', className: '_User', objectId: '2eN0hIjiqu' },
      createdAt: '2016-09-30T11:20:13.522Z',
      updatedAt: '2016-12-02T12:04:56.245Z',
      nameToWords: [],
      descriptionToWords: ['quan', 'vayyyy'],
      additionalPrices: [],
      tags: [],
      additionalProperties: [],
      ACL: { '*': { read: true } },
      objectId: 'jYx0chCLWA' };

      const result = await orderCloud.checkProductStatus(productJSON, 'Tổ Cú Hoàng Quốc Việt');
      return expect(result).toEqual(true);
    });
  });
});
