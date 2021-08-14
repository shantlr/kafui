import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import styled from 'styled-components';

import { List } from 'components/list';
import { Text } from 'components/text';

const GET_DATA = gql`
  query ($id: ID!) {
    consumerGroup(id: $id) {
      id
      state
      protocolType
      protocol
      members {
        id
        clientId
        clientHost
        topics
      }
    }
  }
`;

const Container = styled.div`
  padding: var(--space-md);
`;

export const ConsumerGroupView = ({ groupId }) => {
  const { data, error } = useQuery(GET_DATA, {
    variables: {
      id: groupId,
    },
    skip: !groupId,
  });
  console.log(data, error);
  return (
    <Container>
      {Boolean(data && data.consumerGroup) && (
        <List>
          {data.consumerGroup.members.map((member) => (
            <div key={member.id}>
              <Text as="div">{member.clientId}</Text>
              <Text>{member.topics.join(', ')}</Text>
            </div>
          ))}
        </List>
      )}
    </Container>
  );
};
