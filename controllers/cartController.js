const axios = require("axios"); 
const Cart = require("../models/Cart");


const addToCart = async (req, res) => 
{
    try { 
        const userId = req.user.userId;

        //console.log(req.user);
        const  productId  = req.params.productId; 
        //console.log(productId);
        const { quantity, tailorName } = req.body;

        let product; 
        try 
        {
            const response = await axios.get(`http://localhost:8000/api/products/getproduct/${productId}`);
            product = response.data.data;
            //console.log(product);
        } 
        catch (error) 
        {
            return res.status(400).json({ message: "Invalid product ID or Product Service is unavailable" });
        }

        let cart = await Cart.findOne({ userId});
        if (!cart) {
            cart = new Cart({ userId, items: [], totalPrice: 0 });
        }

        
        const itemIndex = cart.items.findIndex(item => 
            item.productId.toString() === productId.toString() && item.tailorName === tailorName
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity, price: product.price, tailorName });
        }

        
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        await cart.save();

        res.status(200).json({ message: "Item added to cart", cart });
    } 
    catch (error) 
    {
        console.error("Add to cart error:", error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const  productId  = req.params.productId; 

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        
        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => 
            !(item.productId.toString() === productId.toString())
        );

        if (cart.items.length === initialItemCount) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        await cart.save();

        res.status(200).json({ message: "Item removed", cart });
    } catch (error) {
        console.error("Remove from cart error:", error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
};

// Clear Cart
const clearCart = async (req, res) => {
    try 
    {
        const  userId = req.params.userId;
        await Cart.findOneAndDelete({ userId });

        res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        console.error("Clear cart error:", error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
};

// Get Cart
const getCart = async (req, res) => {
    try {
        const  userId  = req.params.userId;
        
        const cart = await Cart.findOne({ userId });
        //console.log("cart",cart);
        if (!cart) return res.status(404).json({ message: "Cart is empty" });

        res.status(200).json(cart);
    }
    catch (error) 
    {
        console.error("Get cart error:", error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = { addToCart, removeFromCart, clearCart, getCart };
