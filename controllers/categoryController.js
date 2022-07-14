const async = require('async');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const Item = require('../models/item');

//Display list of all Categories.
exports.category_list = function (req, res) {
  Category.find({}, 'name')
    .sort({ name: 1 })
    .exec(function (err, list_category) {
      if (err) return next(err);
      res.render('category_list', {
        title: 'Categories',
        category_list: list_category,
      });
    });
};
//Handle detail page fot an category.
exports.category_detail = function (req, res) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.category === null) {
        // No results.
        let err = new Error('Category not found');
        err.status = 404;
        return next(err);
      }
      // Success
      res.render('category_detail', {
        title: 'Category Detail',
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};
//Display category create form on GET.
exports.category_create_get = function (req, res) {
  res.render('category_form', { title: 'Create New Category' });
};
//Handle Category create on POST.
exports.category_create_post = [
  body('name', 'Category name is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      // if there are errors, render form again with previous data
      res.render('category_form', {
        title: 'Create New Category',
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data is valid
      Category.findOne({ name: req.body.name }).exec(function (
        err,
        dupe_category
      ) {
        if (err) return next(err);
        if (dupe_category) res.redirect(dupe_category.url);
        else {
          category.save(function (err) {
            if (err) return next(err);
            res.redirect(category.url);
          });
        }
      });
    }
  },
];
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
