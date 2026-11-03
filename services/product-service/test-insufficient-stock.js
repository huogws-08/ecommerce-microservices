
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const definition = protoLoader.loadSync(
    process.env.PRODUCT_PROTO_PATH || "/proto/product/product.proto",
    {
        keepCase: true,
        defaults: true,
    }
);

const productProto =
    grpc.loadPackageDefinition(definition).product;

const client = new productProto.ProductService(
    "127.0.0.1:50053",
    grpc.credentials.createInsecure()
);

client.CheckAndDecreaseStock(
    {
        pid: "P001",
        quantity: 9999,
    },
    (error, response) => {
        if (error) {
            if (error.code === grpc.status.FAILED_PRECONDITION) {
                console.log("PASS: Insufficient stock rejected");
            } else {
                console.error("FAIL:", error.message);
                process.exitCode = 1;
            }
        } else {
            console.error("FAIL: Stock decrease unexpectedly succeeded");
            console.log(response);
            process.exitCode = 1;
        }

        client.close();
    }
);
