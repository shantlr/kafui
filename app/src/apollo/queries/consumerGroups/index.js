import gql from 'graphql-tag';

export const GET_CONSUMER_GROUPS = gql`
  query getConsumerGroups {
    consumerGroups {
      id
      state
    }
  }
`;

export const GET_CONSUMER_GROUP = gql`
  query getConsumerGroup($id: ID!) {
    consumerGroup(id: $id) {
      id
    }
  }
`;
