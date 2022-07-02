#! /usr/bin/env node

console.log(
  'This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Item = require('./models/item');
var Category = require('./models/category');

var mongoose = require('mongoose');
const category = require('./models/category');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = [];
var categories = [];

function itemCreate(title, category, description, price, stock, cb) {
  itemDetail = { title, category, description, price, stock };
  var item = new Item(itemDetail);

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Item' + item);
    items.push(item);
    cb(null, item);
  });
}

function categoryCreate(name, cb) {
  var category = new Category({ name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category' + category);
    categories.push(category);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series([
    function (callback) {
      categoryCreate('Consoles', callback);
    },
    function (callback) {
      categoryCreate('Games', callback);
    },
    function (callback) {
      categoryCreate('Accessories', callback);
    },
    function (callback) {
      categoryCreate('eCredits', callback);
    },
  ]);
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          '8BitDo SN30 pro+',
          categories[2],
          'Pro+ is the most advanced controller from 8BitDo ever. With 8BitDo Ultimate Software: Customize everything on Pro+ from button mapping, stick & trigger sensitivity, vibration control and even create macros with any button combination. Easily save your settings on a game by game basis with custom profiles.',
          50,
          12,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'PowerA Protection Case for Nintendo Switch',
          categories[2],
          "Take your Nintendo Switch on the go with this sturdy compact case. Inside you'll find a felt lining, screen-protector flap with storage for nine game cards, logo tag and zippered mesh storage pocket. This portable case gives you the freedom to have fun on the go with your Nintendo Switch.",
          29.99,
          12,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'The Legend of Zelda: Breath of The Wild',
          categories[1],
          'Pro+ is the most advanced controller from 8BitDo ever. With 8BitDo Ultimate Software: Customize everything on Pro+ from button mapping, stick & trigger sensitivity, vibration control and even create macros with any button combination. Easily save your settings on a game by game basis with custom profiles.',
          59.99,
          12,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Nintendo Switch OLED',
          categories[0],
          'Pro+ is the most advanced controller from 8BitDo ever. With 8BitDo Ultimate Software: Customize everything on Pro+ from button mapping, stick & trigger sensitivity, vibration control and even create macros with any button combination. Easily save your settings on a game by game basis with custom profiles.',
          300,
          12,
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Nintendo Eshop Card ($50, US)',
          categories[3],
          'Pro+ is the most advanced controller from 8BitDo ever. With 8BitDo Ultimate Software: Customize everything on Pro+ from button mapping, stick & trigger sensitivity, vibration control and even create macros with any button combination. Easily save your settings on a game by game basis with custom profiles.',
          50,
          12,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('Items: ' + items);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
