import fs from 'fs';
import path from 'path';
import { merge } from 'lodash';

const getFilesRecursively = async ({ path: dirPath, ignores = [], filter }) => {
  const res = [];
  const dir = await fs.promises.readdir(dirPath, { withFileTypes: true });
  await Promise.all(
    dir.map(async (f) => {
      if (f.isFile()) {
        const p = path.resolve(dirPath, f.name);
        if (
          ignores.includes(p) ||
          (typeof filter === 'function' &&
            !filter({
              name: f.name,
              path: p,
            }))
        ) {
          return;
        }
        res.push(p);
      } else if (f.isDirectory()) {
        const p = path.resolve(dirPath, f.name);
        const r = await getFilesRecursively({
          path: p,
          ignores,
          filter,
        });
        res.push(...r);
      }
    })
  );

  return res;
};

export const loadGql = async ({ path, ignores }) => {
  const files = await getFilesRecursively({
    path,
    ignores,
    filter: (file) => {
      return file.name.endsWith('.gql');
    },
  });

  return Promise.all(
    files.map((f) => {
      return fs.promises.readFile(f).then((r) => r.toString());
    })
  );
};

export const loadResolvers = async ({ path, ignores }) => {
  const files = await getFilesRecursively({
    path,
    ignores,
    filter: (file) => {
      return file.name.endsWith('.js');
    },
  });
  const resolvers = [{}];
  files.forEach((file) => {
    const mod = require(file);
    if (typeof mod.resolvers === 'object') {
      resolvers.push(mod.resolvers);
    }
  });

  return merge(...resolvers);
};
