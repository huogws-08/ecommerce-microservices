
const Product = require("../models/Product");

// GET /api/products
async function getProducts(req, res) {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to get products",
        });
    }
}

// GET /api/products/:pid
async function getProductById(req, res) {
    try {
        const product = await Product.findOne({
            pid: req.params.pid,
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to get product",
        });
    }
}

// POST /api/products
async function createProduct(req, res) {
    try {
        const { pid, pname, price, quantity } = req.body;

        if (
            typeof pid !== "string" ||
            !pid.trim() ||
            typeof pname !== "string" ||
            !pname.trim() ||
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                message: "Invalid product data",
            });
        }

        const product = await Product.create({
            pid,
            pname,
            price,
            quantity,
        });

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Product ID already exists",
            });
        }

        return res.status(500).json({
            message: "Failed to create product",
        });
    }
}

// PUT /api/products/:pid
async function updateProduct(req, res) {
    try {
        const { pname, price, quantity } = req.body;

        const updates = {};

        if (pname !== undefined) {
            if (typeof pname !== "string" || !pname.trim()) {
                return res.status(400).json({
                    message: "Invalid product name",
                });
            }
            updates.pname = pname;
        }

        if (price !== undefined) {
            if (
                typeof price !== "number" ||
                !Number.isFinite(price) ||
                price < 0
            ) {
                return res.status(400).json({
                    message: "Invalid product price",
                });
            }
            updates.price = price;
        }

        if (quantity !== undefined) {
            if (!Number.isInteger(quantity) || quantity < 0) {
                return res.status(400).json({
                    message: "Invalid product quantity",
                });
            }
            updates.quantity = quantity;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update",
            });
        }

        const product = await Product.findOneAndUpdate(
            { pid: req.params.pid },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update product",
        });
    }
}

// DELETE /api/products/:pid
async function deleteProduct(req, res) {
    try {
        const product = await Product.findOneAndDelete({
            pid: req.params.pid,
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete product",
        });
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
