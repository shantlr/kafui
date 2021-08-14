export const resolvers = {
  KafkaConsumerGroup: {
    id: (group) => group.groupId,
  },
};
