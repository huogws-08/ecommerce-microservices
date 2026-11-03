
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH =
    process.env.PRODUCT_PROTO_PATH ||
    "/proto/product/product.proto";

const definition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
});

const productProto =
    grpc.loadPackageDefinition(definition).product;

const client = new productProto.ProductService(
    "127.0.0.1:50053",
    grpc.credentials.createInsecure()
);

// Bước 1: Lấy thông tin sản phẩm
client.GetProduct({ pid: "P001" }, (error, product) => {
    if (error) {
        console.error("GetProduct error:", error.message);
        client.close();
        process.exitCode = 1;
        return;
    }

    console.log("BEFORE:", product);

    // Bước 2: Giảm tồn kho 3 sản phẩm
    client.CheckAndDecreaseStock(
        {
            pid: "P001",
            quantity: 3,
        },
        (decreaseError, result) => {
            if (decreaseError) {
                console.error(
                    "DecreaseStock error:",
                    decreaseError.message
                );
                client.close();
                process.exitCode = 1;
                return;
            }

            console.log("DECREASE RESULT:", result);

            // Bước 3: Kiểm tra lại tồn kho
            client.GetProduct(
                { pid: "P001" },
                (finalError, updatedProduct) => {
                    if (finalError) {
                        console.error(
                            "GetProduct error:",
                            finalError.message
                        );
                        process.exitCode = 1;
                    } else {
                        console.log("AFTER:", updatedProduct);
                    }

                    client.close();
                }
            );
        }
    );
});
