import { ApolloClient, InMemoryCache } from '@apollo/client';

import { API_URI } from 'config';

export const apolloClient = new ApolloClient({
  uri: API_URI,
  cache: new InMemoryCache(),
});
