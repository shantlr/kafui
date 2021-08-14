import gql from 'graphql-tag';

export const GET_TOPICS = gql`
  query getTopics {
    topics {
      name
    }
  }
`;

export const GET_TOPIC_DETAILS = gql`
  query getTopicDetails($name: String!) {
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
