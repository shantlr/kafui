import { kafka } from '../../../kafka';

export const resolvers = {
  KafkaTopic: {
    partitions: (topic) => {
      return topic.partitions.map((p) => ({
        topic,
        id: p.partitionId,
      }));
    },
    consumerGroups: (topic) => {
      const groupIds = kafka.topicConsumerGroup(topic.name) || [];
      return groupIds.map((id) => ({
        topic,
        group: kafka.consumerGroups[id],
      }));
    },
  },
  KafkaTopicConsumerGroup: {
    offsets: ({ topic, group }) => {
      const offsets = kafka.consumerGroupOffsets(group.groupId, topic.name);
      console.log(offsets);

      return offsets || [];
    },
  },
  KafkaConsumerGroupOffset: {
    partitionId: (offset) => offset.partition,
  },
  KafkaTopicPartition: {
    id: (partition) => `${partition.topic.name}:${partition.id}`,
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
