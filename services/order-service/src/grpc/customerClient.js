
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/customer/customer.proto"
);

const definition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const customerProto =
    grpc.loadPackageDefinition(definition).customer;

const client = new customerProto.CustomerService(
    process.env.CUSTOMER_GRPC_URL || "127.0.0.1:50052",
    grpc.credentials.createInsecure()
);

function getCustomer(uid) {
    return new Promise((resolve, reject) => {
        client.GetCustomer({ uid }, (error, response) => {
            if (error) return reject(error);
            resolve(response);
        });
    });
}

module.exports = { getCustomer };
