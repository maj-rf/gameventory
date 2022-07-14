const Item = require('../models/item');
const Category = require('../models/category');
const async = require('async');
const { body, validationResult } = require('express-validator');
exports.index = function (req, res) {
  async.parallel(
    {
      item_count: function (callback) {
        Item.countDocuments({}, callback);
      },
      category_count: function (callback) {
        Category.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render('index', {
        title: 'Gameventory.GG',
        desc: 'Track your Games++',
        error: err,
        data: results,
      });
    }
  );
};

//Display list of all Items.
exports.item_list = function (req, res) {
  Item.find({}, 'title category')
    .sort({ title: 1 })
    .populate('category')
    .populate('price')
    .populate('stock')
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }
      res.render('item_list', {
        title: 'Available Items',
        item_list: list_items,
      });
    });
};
//Handle detail page fot an Item.
exports.item_detail = function (req, res) {
  Item.findById(req.params.id)
    .populate('category')
    .populate('description')
    .populate('price')
    .populate('stock')
    .exec(function (err, item) {
      if (err) return next(err);
      res.render('item_detail', {
        title: item.title,
        category: item.category,
        description: item.description,
        price: item.price,
        stock: item.stock,
        item: item,
      });
    });
};
//Display Item create form on GET.
exports.item_create_get = function (req, res) {
  Category.find({}, 'name')
    .sort({ name: 1 })
    .exec(function (err, categories) {
      if (err) return next(err);
      res.render('item_form', {
        title: 'Create New Item',
        categories: categories,
      });
    });
};
//Handle Item create on POST.
exports.item_create_post = [
  (req, res, next) => {
    // convert Categories into array
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  //Validate and Sanitize
  body('title', 'Title is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body('description', 'Description is required')
    .trim()
    .isLength({ min: 1, max: 400 })
    .escape(),
  body('price', 'Price is required').trim().isFloat({ min: 1 }).escape(),
  body('stock', 'Stock is required').trim().isInt({ min: 1 }).escape(),
  body('date_updated', 'Invalid date').isISO8601().toDate(),
  body('category.*').escape(),

  (res, req, next) => {
    const errors = validationResult(req);
    const item = new Item({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      //date_updated: req.body.date_updated,
    });

    if (!errors.isEmpty()) {
      Category.find({}, 'name')
        .sort({ name: 1 })
        .exec(function (err, categories) {
          if (err) return next(err);
          for (let i = 0; i < categories.length; i++) {
            if (item.category.indexOf(categories[i]._id) > -1) {
              categories[i].checked = 'true';
            }
          }
          res.render('item_form', {
            title: 'Create New Item',
            item: item,
            categories: categories,
            errors: errors.array(),
          });
        });
      return;
    } else {
      item.save(function (err) {
        if (err) return next(err);
        res.redirect(item.url);
      });
    }
  },
];
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
