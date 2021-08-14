import { forEach, isEqual } from 'lodash';

export const diffRecord = (recordA, recordB) => {
  const res = {
    added: [],
    deleted: [],
    updated: [],
    changed: false,
  };

  // check for deleted
  forEach(recordA, (elem, key) => {
    if (!recordB[key]) {
      res.deleted.push(elem);
    }
  });
  // check for updated and added
  forEach(recordB, (elem, key) => {
    if (!recordA[key]) {
      res.added.push(elem);
    } else if (!isEqual(elem, recordA[key])) {
      res.updated.push({
        prev: recordA[key],
        next: elem,
      });
    }
  });

  res.changed =
    res.added.length > 0 || res.deleted.length > 0 || res.updated.length > 0;

  return res;
};

export const diffArray = (array1, array2) => {
  const a = new Set(array1);
  const b = new Set(array2);

  const r = {
    added: [],
    deleted: [],
  };
  a.forEach((v) => {
    if (!b.has(v)) {
      r.deleted.push(v);
    }
  });
  b.forEach((v) => {
    if (!a.has(v)) {
      r.added.push(v);
    }
  });
  return r;
};
