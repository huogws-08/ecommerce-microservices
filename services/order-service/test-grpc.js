
require("dotenv").config();

const { getCustomer } = require("./src/grpc/customerClient");
const { getProduct } = require("./src/grpc/productClient");

async function main() {
    try {
        const customer = await getCustomer(3);
        console.log("CUSTOMER:", customer);

        const product = await getProduct("P001");
        console.log("PRODUCT:", product);

        console.log("PASS: Order Service connected to gRPC services");
    } catch (error) {
        console.error("FAIL:", error.message);
        process.exitCode = 1;
    }
}

main();
