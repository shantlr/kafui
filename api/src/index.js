import { ApolloServer } from 'apollo-server';

import { config, logger } from './config';
import { loadGqlConfig } from './gql';
import { kafka } from './kafka';

const main = async () => {
  logger.debug(`[config] kafka brokers: ${config.get('kafka.brokers')}`);

  await kafka.connect();
  kafka.startCacheUpdateInterval();

  const { typeDefs, resolvers } = await loadGqlConfig();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
      origin: config.get('server.cors.origin'),
    },
  });

  const { url } = await server.listen(config.get('server.port'));
  logger.info(`Server ready at ${url}`);
};

main();
