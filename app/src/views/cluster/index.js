import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';

import { Spinner } from 'components/spinner';

const Container = styled.div`
  padding: var(--space-md);
`;

const GET_DATA = gql`
  query {
    cluster {
      id
      brokers {
        id
        host
        port
        isController
      }
    }
  }
`;

export const ClusterView = () => {
  const { data, loading } = useQuery(GET_DATA);

  return (
    <Container>
      {loading && <Spinner />}
      {!loading && Boolean(data && data.cluster) && (
        <div>
          {data.cluster.brokers.map((broker) => (
            <div key={broker.id}>
              ID={broker.id} HOST={broker.host}:{broker.port}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};
