import { gql, useQuery } from '@apollo/client';
import { useRouteMatch } from 'react-router';
import styled from 'styled-components';

import { ButtonLink } from 'components/link';
import { List } from 'components/list';
import { Text } from 'components/text';
import { styles } from 'styles';

const Item = styled.div`
  cursor: pointer;
  padding: var(--space-md);
  ${(props) => (props.active ? styles.base.bgHighlight : null)}
  min-width: 175px;

  :hover {
    ${styles.base.bgHighlight}
  }

  ${styles.transition}
`;

const GET_DATA = gql`
  query getData {
    topics {
      name
    }
    consumerGroups {
      id
      state
    }
  }
`;

const ConsumerGroupList = ({ consumerGroups }) => {
  return (
    <div>
      {consumerGroups.map((group) => (
        <ButtonLink key={group.id} to={`/group/${group.id}`}>
          <Item>
            <Text>{group.id}</Text>
          </Item>
        </ButtonLink>
      ))}
    </div>
  );
};

export const TopicsList = ({ topics }) => {
  const urlMatch = useRouteMatch('/topic/:topicName');

  return (
    <List>
      {topics.map((topic) => (
        <ButtonLink key={topic.name} to={`/topic/${topic.name}`}>
          <Item
            active={Boolean(
              urlMatch && urlMatch.params.topicName === topic.name
            )}
          >
            <Text>{topic.name}</Text>
          </Item>
        </ButtonLink>
      ))}
    </List>
  );
};

const Separator = styled.div`
  margin-top: var(--space-md);
  margin-bottom: var(--space-md);
  border-bottom: 4px solid black;
  margin-right: var(--space-md);
  margin-left: var(--space-md);
  box-sizing: border-box;
`;

const Container = styled.div`
  box-shadow: 1px 0px 6px 1px rgba(0, 0, 0, 0.1);
`;

export const MainSideBar = () => {
  const { data } = useQuery(GET_DATA);

  return (
    <Container>
      <ButtonLink to="">
        <Item>Cluster</Item>
      </ButtonLink>
      {Boolean(data && data.consumerGroups) && (
        <>
          <Separator />
          <ConsumerGroupList consumerGroups={data.consumerGroups} />
        </>
      )}

      {Boolean(data && data.topics) && (
        <>
          <Separator />
          <TopicsList topics={data.topics} />
        </>
      )}
    </Container>
  );
};
