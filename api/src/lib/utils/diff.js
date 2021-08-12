import { forEach, isEqual } from 'lodash';

export const diff = (recordA, recordB) => {
  const res = {
    addeds: [],
    deleteds: [],
    updateds: [],
    changed: false,
  };

  // check for deleted
  forEach(recordA, (elem, key) => {
    if (!recordB[key]) {
      res.deleteds.push(elem);
    }
  });
  // check for updated and added
  forEach(recordB, (elem, key) => {
    if (!recordA[key]) {
      res.addeds.push(elem);
    } else if (!isEqual(elem, recordA[key])) {
      res.updateds.push({
        prev: recordA[key],
        next: elem,
      });
    }
  });

  res.changed =
    res.addeds.length > 0 || res.deleteds.length > 0 || res.updateds.length > 0;

  return res;
};
