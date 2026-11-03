
const { Kafka } = require("kafkajs");
const { pool } = require("../config/db");

const kafka = new Kafka({
    clientId: "order-service",
    brokers: (
        process.env.KAFKA_BROKERS || "127.0.0.1:9092"
    ).split(","),
});

const producer = kafka.producer();

let timer = null;
let isPublishing = false;
let isConnected = false;

async function publishPendingEvents() {
    if (isPublishing || !isConnected) {
        return;
    }

    isPublishing = true;

    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");

        const result = await client.query(`
      SELECT event_id, aggregate_id, event_type, payload
      FROM outbox_events
      WHERE published = false
      ORDER BY event_id
      LIMIT 10
      FOR UPDATE SKIP LOCKED
    `);

        for (const event of result.rows) {
            await producer.send({
                topic: "order-created",
                messages: [
                    {
                        key: event.aggregate_id,
                        value: JSON.stringify({
                            event_id: event.event_id,
                            event_type: event.event_type,
                            payload: event.payload,
                        }),
                    },
                ],
            });

            await client.query(
                `UPDATE outbox_events
         SET published = true,
             published_at = CURRENT_TIMESTAMP
         WHERE event_id = $1`,
                [event.event_id]
            );

            console.log(
                `Published outbox event ${event.event_id}`
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(() => { });
        }

        console.error(
            "Outbox publishing error:",
            error.message
        );
    } finally {
        if (client) {
            client.release();
        }

        isPublishing = false;
    }
}

async function startOutboxPublisher() {
    if (timer) {
        return;
    }

    await producer.connect();

    isConnected = true;

    console.log("Kafka producer connected");
    console.log("Outbox Publisher started (every 5 seconds)");

    await publishPendingEvents();

    timer = setInterval(() => {
        publishPendingEvents().catch((error) => {
            console.error("Publisher interval error:", error);
        });
    }, 5000);
}

async function stopOutboxPublisher() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // Chờ vòng publish hiện tại kết thúc.
    while (isPublishing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (isConnected) {
        isConnected = false;
        await producer.disconnect();
    }
}

module.exports = {
    startOutboxPublisher,
    stopOutboxPublisher,
    publishPendingEvents,
};
