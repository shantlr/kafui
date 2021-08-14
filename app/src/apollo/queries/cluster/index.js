import gql from 'graphql-tag';

export const GET_CLUSTER = gql`
  query getCluster {
    cluster {
      id
      brokers {
        id
        host
        port
      }
    }
  }
`;
