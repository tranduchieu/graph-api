/* global Parse */
import Promise from 'bluebird';
import tabletojson from 'tabletojson';
import csvParse from 'csv-parse';
import { readFile, readdir } from 'fs';
import path from 'path';

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

      const wardsOfBaDinh = ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc'];
      const wards = province === 'Hà Nội' && name === 'Quận Ba Đình' ? wardsOfBaDinh : [];
      return newDistrict.save({ name, province, wards }, { useMasterKey: true });
    })
    .then(() => {
      return res.success('Done!');
    })
    .catch(error => {
      return res.error(error.message);
    });
  });
});

Parse.Cloud.job('addWards', (req, res) => {
  const filesPath = path.join(__dirname, '../../data/files/wards');
  return readdir(filesPath, (err, files) => {
    return Promise.each(files, file => {
      return readFile(path.join(__dirname, `../../data/files/wards/${file}`), 'utf8', (err0, data) => {
        if (err0) return res.error(err.message);

        const province = file.replace(/.[^.]+$/, '');
        return csvParse(data, { comment: '#' }, async (err2, output) => {
          return await Promise.map(output, async line => {
            const queryDistrict = new Parse.Query('District');
            queryDistrict.equalTo('province', province);
            queryDistrict.equalTo('name', line[2]);
            const districtObj = await queryDistrict.first({ useMasterKey: true });

            if (!districtObj) return res.error(`District ${line[2]}, ${province} not found`);

            const wards = districtObj.get('wards');
            if (wards.indexOf(`${line[0]} ${line[1]}`) === -1) {
              wards.push(`${line[0]} ${line[1]}`);
              districtObj.set('wards', wards);
              return districtObj.save(null, { useMasterKey: true });
            }
            return Promise.resolve(null);
          }, { concurrency: 5 })
          .then(console.log);
        });
      });
    })
    .then(() => {
      return res.success('Done!');
    })
    .catch(err4 => {
      return res.error(err4.message);
    });
  });
});
