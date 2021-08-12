import gql from 'graphql-tag';

export const GET_TOPICS = gql`
  query {
    topics {
      name
    }
  }
`;

export const GET_TOPIC_DETAILS = gql`
  query ($name: String!) {
    topic(name: $name) {
      name
      partitions {
        id
        offset
        offsetHigh
        offsetLow
      }
    }
  }
`;
