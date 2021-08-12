import { useQuery } from '@apollo/client';
import { useRouteMatch } from 'react-router';
import styled from 'styled-components';

import { GET_TOPICS } from 'apollo/queries/topic';
import { ButtonLink } from 'components/link';
import { List } from 'components/list';
import { Text } from 'components/text';
import { styles } from 'styles';

const Item = styled.div`
  cursor: pointer;
  padding: var(--space-md);
  ${(props) => (props.active ? styles.base.bgHighlight : null)}

  :hover {
    ${styles.base.bgHighlight}
  }

  ${styles.transition}
`;

export const TopicsList = () => {
  const { data } = useQuery(GET_TOPICS);

  const urlMatch = useRouteMatch('/topic/:topicName');

  return (
    <List>
      {Boolean(data && data.topics) &&
        data.topics.map((topic) => (
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
  return (
    <Container>
      <Separator />
      <TopicsList />
    </Container>
  );
};
