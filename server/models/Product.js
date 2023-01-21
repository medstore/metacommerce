const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  storeId:{
    type: String,
    required: [true, "Please provide storeId"],
  },
  productName: {
    type: String,
    required: [true, "Please provide Productname"],
  },
  productDescription: {
    type: String,
    required: [true, "Please provide ProductDescription"],
  },
  productImg: {
    type: String,
    required: [true, "Please provide ProductUrl"],
},
  productPrice: {
    type: Number,
    required: [true, "Please provide productPrice"],
  },
  
},
{timestamps: true});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;