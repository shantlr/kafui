import { sortBy } from 'lodash';
import { kafka } from '../../../kafka';

export const resolvers = {
  Query: {
    topics: () => {
      return sortBy(kafka.topics, 'name');
    },

    topic: (root, { name }) => {
      const topic = kafka.topics[name];
      return topic;
    },
  },
};
