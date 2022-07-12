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

//Export model
module.exports = mongoose.model('Item', ItemSchema);
