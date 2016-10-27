import Parse from 'parse/node';

const ITEMS_PER_QUERY = 100;

// Query base
// [x] Tìm những product không tồn tại additionalPrices
const query = () => {
  const queryProduct = new Parse.Query('Product');
  queryProduct.doesNotExist('additionalPrices');
  return queryProduct;
};


async function additionalPricesToArray() {
  // Count total
  let itemsNeedRepair = 0;

  try {
    itemsNeedRepair = await query().count({ useMasterKey: true });
  } catch (error) {
    throw error;
  }

  while (itemsNeedRepair > 0) {
    try {
      const queryItems = await query().limit(ITEMS_PER_QUERY).find({ useMasterKey: true });
      queryItems.forEach(item => {
        item.set('additionalPrices', []);
        item.save(null, { useMasterKey: true })
        .then(console.log);
      });
    } catch (error) {
      throw error;
    }

    itemsNeedRepair -= ITEMS_PER_QUERY;
  }

  return 'ok';
}

// Run
try {
  additionalPricesToArray();
} catch (error) {
  console.error(error);
}


