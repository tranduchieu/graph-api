/* global Parse */
import Promise from 'bluebird';
import tabletojson from 'tabletojson';

Parse.Cloud.job('addDistricts', (req, res) => {
  const url = 'https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_%C4%91%C6%A1n_v%E1%BB%8B_h%C3%A0nh_ch%C3%ADnh_c%E1%BA%A5p_huy%E1%BB%87n_c%E1%BB%A7a_Vi%E1%BB%87t_Nam';

  tabletojson.convertUrl(url, (tablesAsJson) => {
    const districtList = tablesAsJson[0];
    Promise.each(districtList, district => {
      let name = district['Tên\nthành phố,\nquận/huyện/\nthị xã'];
      let province = district['Tỉnh/\nThành phố'];
      const note = district['Chú thích'];

      switch (province) {
        case 'Bà Rịa-Vũng Tàu':
          province = 'Bà Rịa - Vũng Tàu';
          break;
        case 'Thừa Thiên-Huế':
          province = 'Thừa Thiên - Huế';
          break;
        case 'Đăk Nông':
          province = 'Đắk Nông';
          break;
        default:
          break;
      }

      switch (note) {
        case 'thành phố':
        case 'Thành phố':
          name = `Thành phố ${name}`;
          break;
        case 'thị xã':
        case 'Thị xã':
          name = `Thị xã ${name}`;
          break;
        case 'quận':
        case 'Quận':
          name = `Quận ${name}`;
          break;
        default:
          name = `Huyện ${name}`;
          break;
      }

      const District = Parse.Object.extend('District');
      const newDistrict = new District();

      return newDistrict.save({ name, province }, { useMasterKey: true });
    })
    .then(() => {
      return res.success('Done!');
    })
    .catch(error => {
      return res.error(error.message);
    });
  });
});

