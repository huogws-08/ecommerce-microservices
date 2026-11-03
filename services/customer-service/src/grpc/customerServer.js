
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { pool } = require("../config/db");

const protoPath = path.resolve(
    __dirname,
    "../../../../proto/customer/customer.proto"
);

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

async function getCustomerGrpc(call, callback) {
    const uid = Number(call.request.uid);

    if (!Number.isInteger(uid) || uid <= 0) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            details: "Invalid customer ID",
        });
    }

    try {
        const result = await pool.query(
            `SELECT c.uid, c.full_name, c.phone, c.address,
              COALESCE(m.score, 0) AS score,
              COALESCE(m.tier, 'BRONZE') AS tier
       FROM customers c
       LEFT JOIN memberships m ON c.uid = m.uid
       WHERE c.uid = $1`,
            [uid]
        );

        if (result.rows.length === 0) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: "Customer not found",
            });
        }

        const customer = result.rows[0];

        return callback(null, {
            uid: customer.uid,
            full_name: customer.full_name || "",
            phone: customer.phone || "",
            address: customer.address || "",
            score: customer.score,
            tier: customer.tier,
        });
    } catch (error) {
        console.error("getCustomerGrpc error:", error);

        return callback({
            code: grpc.status.INTERNAL,
            details: "Internal server error",
        });
    }
}

function startGrpcServer() {
    const server = new grpc.Server();

    server.addService(customerProto.CustomerService.service, {
        GetCustomer: getCustomerGrpc,
    });

    const port = process.env.GRPC_PORT || 50052;

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, actualPort) => {
            if (error) {
                console.error("gRPC server error:", error);
                return;
            }

            console.log(`Customer gRPC listening on port ${actualPort}`);
        }
    );
}

module.exports = { startGrpcServer };
