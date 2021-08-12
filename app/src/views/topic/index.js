import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import { GET_TOPIC_DETAILS } from 'apollo/queries';
import { List } from 'components/list';
import { Text } from 'components/text';

const Container = styled.div`
  padding: var(--space-md);
`;

export const TopicView = ({ topicName }) => {
  const { data, loading } = useQuery(GET_TOPIC_DETAILS, {
    variables: {
      name: topicName,
    },
    skip: !topicName,
  });

  console.log(data);
  return (
    <Container>
      <Text size="lg">{topicName}</Text>
      {Boolean(data && data.topic) && (
        <List>
          {data.topic.partitions.map((partition) => (
            <div key={partition.id}>
              <Text>{partition.id}</Text> -{' '}
              <Text>First offset: {partition.offsetLow}</Text> -{' '}
              <Text>Last offset: {partition.offsetHigh}</Text>
            </div>
          ))}
        </List>
      )}
    </Container>
  );
};
