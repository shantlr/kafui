const PREFIX = `\x00\x01\x00\x00\x00\x04\x00\f`;
const SUFFIX = `\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00`;
const SEPARATOR = `\x00\x00\x00\x01\x00\x00\x00\x00\x00\f`;
export const parseMemberAssignmentBuffer = (buffer) => {
  const assignment = buffer.toString();
  return assignment
    .substr(PREFIX.length, assignment.length - (PREFIX.length + SUFFIX.length))
    .split(SEPARATOR);
};
