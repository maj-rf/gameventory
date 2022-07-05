const Item = require('../models/item');

//Display list of all Items.
exports.item_list = function (req, res) {
  res.send('Item List');
};
//Handle detail page fot an Item.
exports.item_detail = function (req, res) {
  res.send('Item');
};
//Display Item create form on GET.
exports.item_create_get = function (req, res) {
  res.send('Item Create GET');
};
//Handle Item create on POST.
exports.item_create_post = function (req, res) {
  res.send('Item Create POST');
};
// Display Item delete form on GET.
exports.item_delete_get = function (req, res) {
  res.send('Item Delete GET');
};
// Handle Item delete on POST.
exports.item_delete_post = function (req, res) {
  res.send('Item Delete POST');
};
// Display Item update form on GET.
exports.item_update_get = function (req, res) {
  res.send('Item Update GET');
};
// Handle Item update on POST.
exports.item_update_post = function (req, res) {
  res.send('Item Update POST');
};
