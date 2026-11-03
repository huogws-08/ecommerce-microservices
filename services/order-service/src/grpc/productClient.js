const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/product/product.proto"
);

const definition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const productProto =
    grpc.loadPackageDefinition(definition).product;

const client = new productProto.ProductService(
    process.env.PRODUCT_GRPC_URL || "127.0.0.1:50053",
    grpc.credentials.createInsecure()
);

function getProduct(pid) {
    return new Promise((resolve, reject) => {
        client.GetProduct({ pid }, (error, response) => {
            if (error) return reject(error);
            resolve(response);
        });
    });
}

function checkAndDecreaseStock(pid, quantity) {
    return new Promise((resolve, reject) => {
        client.CheckAndDecreaseStock(
            { pid, quantity },
            (error, response) => {
                if (error) return reject(error);
                resolve(response);
            }
        );
    });
}

function increaseStock(pid, quantity) {
    return new Promise((resolve, reject) => {
        client.IncreaseStock(
            { pid, quantity },
            (error, response) => {
                if (error) return reject(error);
                resolve(response);
            }
        );
    });
}

module.exports = {
    getProduct,
    checkAndDecreaseStock,
    increaseStock,
};