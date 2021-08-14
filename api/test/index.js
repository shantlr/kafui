import { Kafka } from 'kafkajs';

const main = async () => {
  const k = new Kafka({
    clientId: 'test',
    brokers: ['localhost:9092'],
  });

  const consumer = k.consumer({
    groupId: 'test-group',
  });

  consumer.subscribe({ topic: 'TEST_TOPIC_1' });
  consumer.subscribe({ topic: 'TEST_TOPIC_2' });
  consumer.subscribe({ topic: 'TEST_TOPIC_3' });
  consumer.subscribe({ topic: 'TEST_TOPIC_4' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      console.log(topic, message.value.toString());
    },
  });

  const producer = k.producer({});
  await producer.connect();

  setInterval(() => {
    producer
      .send({
        topic: 'TEST_TOPIC_1',
        messages: [
          {
            key: '1',
            value: 'TEST',
          },
        ],
      })
      .then(() => {
        console.log('MSG SENT');
      });
  }, 30 * 1000);
};

main();
