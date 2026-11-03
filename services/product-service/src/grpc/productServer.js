const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const Product = require("../models/Product");

const PROTO_PATH =
    process.env.PRODUCT_PROTO_PATH ||
    path.resolve(__dirname, "../../../../proto/product/product.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const productProto =
    grpc.loadPackageDefinition(packageDefinition).product;

async function getProduct(call, callback) {
    try {
        const product = await Product.findOne({
            pid: call.request.pid,
        });

        if (!product) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: "Product not found",
            });
        }

        return callback(null, {
            pid: product.pid,
            pname: product.pname,
            price: product.price,
            quantity: product.quantity,
        });
    } catch (error) {
        console.error("GetProduct error:", error);

        return callback({
            code: grpc.status.INTERNAL,
            message: "Failed to get product",
        });
    }
}

async function checkAndDecreaseStock(call, callback) {
    try {
        const { pid, quantity } = call.request;

        if (
            typeof pid !== "string" ||
            !pid.trim() ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Invalid product ID or quantity",
            });
        }

        const product = await Product.findOneAndUpdate(
            {
                pid,
                quantity: { $gte: quantity },
            },
            {
                $inc: { quantity: -quantity },
            },
            {
                new: true,
            }
        );

        if (!product) {
            const exists = await Product.exists({ pid });

            return callback({
                code: exists
                    ? grpc.status.FAILED_PRECONDITION
                    : grpc.status.NOT_FOUND,
                message: exists
                    ? "Insufficient stock"
                    : "Product not found",
            });
        }

        return callback(null, {
            success: true,
            message: "Stock decreased successfully",
            remaining_quantity: product.quantity,
        });
    } catch (error) {
        console.error("CheckAndDecreaseStock error:", error);

        return callback({
            code: grpc.status.INTERNAL,
            message: "Failed to decrease stock",
        });
    }
}

async function increaseStock(call, callback) {
    try {
        const { pid, quantity } = call.request;

        if (
            typeof pid !== "string" ||
            !pid.trim() ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Invalid product ID or quantity",
            });
        }

        const product = await Product.findOneAndUpdate(
            { pid },
            { $inc: { quantity } },
            { new: true }
        );

        if (!product) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: "Product not found",
            });
        }

        return callback(null, {
            success: true,
            message: "Stock restored successfully",
            remaining_quantity: product.quantity,
        });
    } catch (error) {
        console.error("IncreaseStock error:", error);

        return callback({
            code: grpc.status.INTERNAL,
            message: "Failed to restore stock",
        });
    }
}

function startGrpcServer() {
    return new Promise((resolve, reject) => {
        const server = new grpc.Server();

        server.addService(productProto.ProductService.service, {
            GetProduct: getProduct,
            CheckAndDecreaseStock: checkAndDecreaseStock,
            IncreaseStock: increaseStock,
        });

        const port = process.env.GRPC_PORT || 50053;

        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (error) => {
                if (error) {
                    return reject(error);
                }

                console.log(`Product gRPC listening on port ${port}`);
                resolve(server);
            }
        );
    });
}

module.exports = startGrpcServer;