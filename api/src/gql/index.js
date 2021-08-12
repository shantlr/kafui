import path from 'path';

import { loadGql, loadResolvers } from '../lib/utils/loadFile';

export const loadGqlConfig = async () => {
  const [typeDefs, resolvers] = await Promise.all([
    loadGql({
      path: path.resolve(__dirname),
    }),
    loadResolvers({
      path: path.resolve(__dirname),
      ignores: [__filename],
    }),
  ]);

  return {
    typeDefs,
    resolvers,
  };
};
