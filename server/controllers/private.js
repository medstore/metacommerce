const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const Store = require("../models/Store");
const Product = require("../models/Product");
const Order = require('../models/Order')
require('dotenv').config({path:"./config.env"})
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { use } = require("../routes/private");
//get user data
exports.getuser = async (req, res, next) => {
    try {
        const { _id, userName, userEmail, profileImg, ...other } = req.user;
        res.status(200).json({ _id, userName,  userEmail, profileImg });
    } catch (err) {
        next(err);
        
    }
};


//checkauth
exports.checkauth = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        // console.log(token)
        if (!token) {
            return res.status(401).send({
              message: 'Unauthorized access'
            });
          }
           var bearer = token.split(" ");
            var token1 = bearer[1];
        //   console.log(token1)
          jwt.verify(token1, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
              return res.status(401).send({
                message: 'Invalid token'
              });
            }
            // console.log(decoded)
            // If token is valid, get user details from database and return
            User.findOne({ _id: decoded.id }, (err, user) => {
              if (err) {
                return res.status(500).send({
                  message: 'Error retrieving user details'
                });
              }
              return res.status(200).send({
                user: user
              });
            });
          });
    } catch (err) {
        next(err);
    }
};

//addtocart
exports.additemtocart = async (req, res, next) => {
    try {
        const user = await User.findById(req.body.userId);
        console.log(user)
        if (user) {
            await User.updateOne({ _id: req.body.userId } , { $push: { cartItem: req.body.productId } });
            res.status(200).json(req.user);
        } else {
            res.status(404).json({ sucess: false, error: "Error Occured" });
        }
    } catch (err) {
        next(err);
    }
};


//removefromcart
exports.removeitemfromcart = async (req, res, next) => {
    try {
        const user = await User.findById(req.body.userId);
        // console.log(user)
        if (user) {
            await User.update({ _id: req.body.userId } ,{ $pull: { cartItem: req.body.productId } });
            res.status(200).json(req.user);
        } else {
            res.status(404).json({ sucess: false, error: "Error Occured" });
        }
    } catch (err) {
        next(err);
    }
};

//getCartItem
exports.getAllCartItem = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const cartItem = await Promise.all(
            currentUser.cartItem.map((itemId) => {
                return Product.findById(itemId);
            })
        );
        res.status(200).json(cartItem);
    } catch (err) {
        next(err);
    }
};


//GetAllorderofUser
exports.getorderhistory = async (req, res, next) => {
    try {
        const order = await Order.find({ userId: req.body.userId }).sort({createdAt: -1});
        res.status(200).json(order);
    } catch (err) {
        next(err);
        console.log(err)
    }
}

//buy product

exports.buyproduct = async (req, res, next) => {
    try {
        const receiveItem = req.body.items;
        const deliveryAddress = req.body.deliveryAddress;
        
        for (const obj of receiveItem) {
            const { userId, userName, storeId, totalPrice } = obj;
            const productId = obj.productId;
            const productQuantity = obj.productQuantity;
            const productName = obj.productName;
            const productImg = obj.productImg;
            const productPrice = obj.productPrice;
             
            const order = await Order.create({
                userId: userId,
                userName: userName,
                storeId: storeId,
                totalPrice: totalPrice,
                productId: productId,
                productQuantity: productQuantity,
                productName : productName,
                productImg : productImg,
                productPrice : productPrice,
                deliveryAddress: deliveryAddress
            });

            const user = await User.findById(userId);
            // console.log(user)
            if (user) {
                await User.update({ _id: userId } ,{ cartItem: [] } );
                res.status(200).json(req.user);
            }

        }
 
        res.status(200).json({ sucess: true, message: "Order Successfull" });

    } catch (err) {
        next(err);
        console.log(err)
    }


}



exports.cancelorder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndRemove(req.body.orderId);
        res.status(200).json({ sucess: true, message: "Cancelled Successfully" });
    } catch (err) {
        next(err);
        console.log(err)
    }
}


//update status
exports.addreviews = async (req, res, next) => {
    
    try {
        const order = await Order.findById(req.body.orderId);
        if (order) {
            await order.updateOne({ $set: { review: req.body.review } });
        }
        res.status(200).json({ sucess: true, message: "review added Successfully" });
    } catch (err) {
        next(err);
        console.log(err)
    }
}
