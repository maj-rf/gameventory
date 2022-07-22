const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    maxLength: 50,
  }, //reference to the associated category
  description: { type: String, required: true, maxLength: 400 },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  date_updated: { type: Date, default: Date.now },
  date_added: { type: Date },
});

// Virtual for author's URL
ItemSchema.virtual('url').get(function () {
  return '/home/item/' + this._id;
});

ItemSchema.virtual('date_updated_formatted').get(function () {
  return DateTime.fromJSDate(this.date_updated).toLocaleString(
    DateTime.DATE_MED
  );
});
ItemSchema.virtual('date_added_formatted').get(function () {
  return DateTime.fromJSDate(this.date_added).toLocaleString(DateTime.DATE_MED);
});
ItemSchema.virtual('date_diff').get(function () {
  const rtf = new Intl.RelativeTimeFormat('en', {
    localeMatcher: 'best fit',
    numeric: 'always',
    style: 'long',
  });
  const diff = Math.floor(
    new Date(this.date_added - new Date()) / (1000 * 60 * 60 * 24)
  );
  return rtf.format(diff, 'days');
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);
