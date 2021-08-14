import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';

import { List } from 'components/list';
import { Spinner } from 'components/spinner';
import { Text } from 'components/text';

const Container = styled.div`
  padding: var(--space-md);
  flex-grow: 1;
`;

const PartitionList = styled(List)`
  max-height: 300px;
  height: fit-content;
  width: 100%;
`;

const GET_DATA = gql`
  query ($name: String!) {
    topic(name: $name) {
      name
      partitions {
        id
        offsetLow
        offsetHigh
      }
      consumerGroups {
        group {
          id
        }
        offsets {
          partitionId
          offset
        }
      }
    }
  }
`;

export const TopicView = ({ topicName }) => {
  const { data, loading } = useQuery(GET_DATA, {
    variables: {
      name: topicName,
    },
    skip: !topicName,
  });

  return (
    <Container>
      <Text as="div" size="lg">
        {topicName}
      </Text>
      {loading && <Spinner />}
      {Boolean(data && data.topic) && (
        <>
          <PartitionList>
            {data.topic.partitions.map((partition) => (
              <div key={partition.id}>
                <Text>{partition.id}</Text> -{' '}
                <Text>First offset: {partition.offsetLow}</Text> -{' '}
                <Text>Last offset: {partition.offsetHigh}</Text>
              </div>
            ))}
          </PartitionList>
          <List>
            {data.topic.consumerGroups.map(({ group, offsets }) => (
              <div key={group.id}>
                <Text as="div">{group.id}</Text>
                {offsets.map((off) => (
                  <div key={off.partitionId}>
                    {off.partitionId} - {off.offset}
                  </div>
                ))}
              </div>
            ))}
          </List>
        </>
      )}
    </Container>
  );
};
