const Category = require('../models/category');

//Display list of all Categories.
exports.category_list = function (req, res) {
  res.send('Category List');
};
//Handle detail page fot an category.
exports.category_detail = function (req, res) {
  res.send('Category');
};
//Display category create form on GET.
exports.category_create_get = function (req, res) {
  res.send('Category Create GET');
};
//Handle Category create on POST.
exports.category_create_post = function (req, res) {
  res.send('Category Create POST');
};
// Display Category delete form on GET.
exports.category_delete_get = function (req, res) {
  res.send('CategoryDelete GET');
};
// Handle category delete on POST.
exports.category_delete_post = function (req, res) {
  res.send('Category Delete POST');
};
// Display category update form on GET.
exports.category_update_get = function (req, res) {
  res.send('Category Update GET');
};
// Handle category update on POST.
exports.category_update_post = function (req, res) {
  res.send('Category Update POST');
};
