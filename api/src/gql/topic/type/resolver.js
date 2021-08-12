import { kafka } from '../../../kafka';

export const resolvers = {
  KafkaTopic: {
    partitions: (topic) => {
      return topic.partitions.map((p) => ({
        topic,
        id: p.partitionId,
      }));
    },
  },
  KafkaTopicPartition: {
    offset: (partition) => {
      const offset = kafka.partitionOffset(partition.topic.name, partition.id);
      if (!offset) {
        return null;
      }
      return offset.offset;
    },
    offsetHigh: (partition) => {
      const offset = kafka.partitionOffset(partition.topic.name, partition.id);
      if (!offset) {
        return null;
      }
      return offset.high;
    },
    offsetLow: (partition) => {
      const offset = kafka.partitionOffset(partition.topic.name, partition.id);
      if (!offset) {
        return null;
      }
      return offset.low;
    },
  },
};
