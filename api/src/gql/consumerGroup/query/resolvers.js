import { map, sortBy } from 'lodash';
import { kafka } from '../../../kafka';

export const resolvers = {
  Query: {
    consumerGroups: () => {
      return sortBy(map(kafka.consumerGroups), 'groupId');
    },
    consumerGroup: (root, { id }) => {
      return kafka.consumerGroups[id];
    },
  },
};
