import { createClient } from 'redis';

// Create a Redis client for publishing
const publisher = createClient();
publisher.connect();

// Create a Redis client for subscribing
const subscriber = createClient();
subscriber.connect();

// Subscribing to a channel
subscriber.subscribe('notifications', (message) => {
  console.log(`Received message: ${message}`);
});

// Publishing a message to the 'notifications' channel
async function publishMessage() {
  await publisher.publish('notifications', 'Hello from Redis Pub/Sub!');
  console.log('Message published');
}

// Publish the message
publishMessage().catch((error) => console.error('Error publishing message:', error));
