
const { Kafka } = require("kafkajs");
const Shipment = require("../models/Shipment");

const kafka = new Kafka({
    clientId: "shipment-service",
    brokers: (
        process.env.KAFKA_BROKERS || "127.0.0.1:9092"
    ).split(","),
});

const consumer = kafka.consumer({
    groupId:
        process.env.KAFKA_GROUP_ID ||
        "shipment-service-group",
});

const topic = process.env.KAFKA_TOPIC || "order-created";

let started = false;

async function startOrderConsumer() {
    if (started) return;

    await consumer.connect();

    try {
        await consumer.subscribe({
            topic,
            fromBeginning: true,
        });

        started = true;

        console.log("Shipment Kafka Consumer connected");
        console.log(`Subscribed to topic: ${topic}`);

        await consumer.run({
            eachMessage: async ({ message }) => {
                const event = JSON.parse(
                    message.value.toString()
                );

                if (event.event_type !== "ORDER_CREATED") {
                    return;
                }

                const payload = event.payload;

                // Bỏ qua event thử nghiệm ở phần 5.9.
                if (payload?.test === true) {
                    console.log(
                        `Skipping test event ${event.event_id}`
                    );
                    return;
                }

                const oid = Number(payload?.oid);
                const uid = Number(payload?.uid);

                if (
                    !Number.isSafeInteger(oid) ||
                    oid <= 0 ||
                    !Number.isSafeInteger(uid) ||
                    uid <= 0
                ) {
                    throw new Error(
                        `Invalid ORDER_CREATED event ${event.event_id}`
                    );
                }

                const shipid = `SHP${String(oid).padStart(
                    6,
                    "0"
                )}`;

                // Upsert theo oid để xử lý Kafka gửi trùng.
                const shipment = await Shipment.findOneAndUpdate(
                    { oid },
                    {
                        $setOnInsert: {
                            shipid,
                            oid,
                            uid,
                            status: "PENDING",
                            created_from_event_id: event.event_id,
                        },
                    },
                    {
                        upsert: true,
                        new: true,
                        runValidators: true,
                    }
                );

                console.log(
                    `Shipment ready: ${shipment.shipid}, order ${oid}`
                );
            },
        });
    } catch (error) {
        started = false;
        await consumer.disconnect().catch(() => { });
        throw error;
    }
}

async function stopOrderConsumer() {
    if (!started) return;

    await consumer.disconnect();
    started = false;
}

module.exports = {
    startOrderConsumer,
    stopOrderConsumer,
};
