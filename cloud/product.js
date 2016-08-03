/* global Parse */
Parse.Cloud.afterSave('Product', (req, res) => {
  const boxes = req.object.get('boxes');
  console.log(boxes);
  return res.success();
});
