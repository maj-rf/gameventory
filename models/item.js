const mongoose = require('mongoose');
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
});

// Virtual for author's URL
ItemSchema.virtual('url').get(function () {
  return '/catalog/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);
