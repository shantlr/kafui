export const resolvers = {
  KafkaCluster: {
    id: (cluster) => cluster.clusterId,
  },
  KafkaBroker: {
    id: (broker) => broker.nodeId,
  },
};
