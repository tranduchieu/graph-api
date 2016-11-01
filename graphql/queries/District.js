import Parse from 'parse/node';
import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
} from 'graphql';

export default {
  provinces: {
    type: new GraphQLList(GraphQLString),
    resolve() {
      return ['Hà Nội', 'TP Hồ Chí Minh', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Bình Định', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Bến Tre', 'Cao Bằng', 'Cà Mau', 'Cần Thơ', 'Gia Lai', 'Hòa Bình', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hưng Yên', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Long An', 'Lào Cai', 'Lâm Đồng', 'Lạng Sơn', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Thanh Hóa', 'Thái Bình', 'Thái Nguyên', 'Thừa Thiên - Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Tây Ninh', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái', 'Điện Biên', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Đồng Nai', 'Đồng Tháp'];
    },
  },
  districts: {
    type: new GraphQLList(GraphQLString),
    args: {
      province: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    async resolve(root, { province }) {
      const districtQuery = new Parse.Query('District');
      districtQuery.equalTo('province', province);
      const districtObjs = await districtQuery.find({ useMasterKey: true });
      const result = [];

      if (districtObjs.length > 0) {
        districtObjs.forEach(districtObj => {
          result.push(districtObj.get('name'));
        });
      }

      return result;
    },
  },
  wards: {
    type: new GraphQLList(GraphQLString),
    args: {
      province: {
        type: new GraphQLNonNull(GraphQLString),
      },
      district: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    async resolve(root, { province, district }) {
      const districtQuery = new Parse.Query('District');
      districtQuery.equalTo('province', province);
      districtQuery.equalTo('name', district);
      const districtObj = await districtQuery.first({ useMasterKey: true });
      const result = districtObj ? districtObj.get('wards') : [];

      return result;
    },
  },
};
