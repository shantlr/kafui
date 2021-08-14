import { kafka } from '../../../kafka';

export const resolvers = {
  Query: {
    cluster() {
      return kafka.cluster;
    },
  },
};
