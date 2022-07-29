const Item = require('../models/item');
const Category = require('../models/category');
const async = require('async');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

exports.index = function (req, res) {
  async.parallel(
    {
      recents: function (callback) {
        Item.find({})
          .sort({ date_added: -1 })
          .populate('category')
          .limit(4)
          .exec(callback);
      },
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
exports.item_list = function (req, res, next) {
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
exports.item_detail = function (req, res, next) {
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
exports.item_create_get = function (req, res, next) {
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
  upload.single('image'),
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
  //body('date_updated', 'Invalid date').isISO8601().toDate(),
  body('category.*').escape(),

  function (req, res, next) {
    const errors = validationResult(req);
    const img = fs.readFileSync(req.file?.path);
    const encoded_image = img.toString('base64');
    const image = {
      mimetype: req.file.mimetype,
      imageBuffer: Buffer.from(encoded_image, 'base64'),
    };
    const item = new Item({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      date_added: Date.now(),
      image: image,
      //date_updated: req.body.date_updated,
    });

    if (!errors.isEmpty()) {
      Category.find({}, 'name')
        .sort({ name: 1 })
        .exec(function (err, categories) {
          if (err) return next(err);
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
exports.item_delete_get = function (req, res, next) {
  Item.findById(req.params.id).exec(function (err, selectedItem) {
    if (err) return next(err);
    if (selectedItem == null) {
      res.redirect('/home/items');
    }
    res.render('item_delete', { title: 'Delete Item', item: selectedItem });
  });
};
// Handle Item delete on POST.
exports.item_delete_post = function (req, res, next) {
  Item.findById(req.body.itemid).exec(function (err, selectedItem) {
    if (err) return next(err);
    else {
      Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) return next(err);
        res.redirect('/home/items');
      });
    }
  });
};

// Display Item update form on GET.
exports.item_update_get = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        Item.findById(req.params.id)
          .populate('category')
          .populate('description')
          .populate('price')
          .populate('stock')
          .exec(callback);
      },
      categories: function (callback) {
        Category.find({}, 'name').sort({ name: 1 }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render('item_form', {
        title: 'Update Item',
        categories: results.categories,
        item: results.item,
      });
    }
  );
};
// Handle Item update on POST.
exports.item_update_post = [
  upload.single('image'),
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
  //body('date_updated', 'Invalid date').isISO8601().toDate(),
  body('category.*').escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const { image } = await Item.findById(req.params.id);
    const title = req.body.title;
    const category =
      typeof req.body.category === 'undefined' ? [] : req.body.category;
    const description = req.body.description;
    const price = req.body.price;
    const stock = req.body.stock;
    const item = new Item({
      title: req.body.title,
      category:
        typeof req.body.category === 'undefined' ? [] : req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      image: image,
      //date_updated: req.body.date_updated,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      Category.find({}, 'name')
        .sort({ name: 1 })
        .exec(function (err, categories) {
          if (err) return next(err);
          res.render('item_form', {
            title: 'Update Item',
            item: item,
            categories: categories,
            errors: errors.array(),
          });
        });
      return;
    }
    if (!req.file) {
      console.log('test');
      await Item.findByIdAndUpdate(req.params.id, item);
    } else {
      const img = fs.readFileSync(req.file.path);
      const encoded_image = img.toString('base64');
      const image = {
        mimetype: req.file.mimetype,
        imageBuffer: Buffer.from(encoded_image, 'base64'),
      };
      const item = new Item({
        title: req.body.title,
        category:
          typeof req.body.category === 'undefined' ? [] : req.body.category,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        image: image,
        //date_updated: req.body.date_updated,
        _id: req.params.id, //This is required, or a new ID will be assigned!
      });

      await Item.findByIdAndUpdate(req.params.id, item);
    }
    res.redirect(item.url);
  },
];
