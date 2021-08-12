import { Route, Switch } from 'react-router-dom';

import { TopicView } from 'views/topic';

export const Router = () => {
  return (
    <Switch>
      <Route
        path="/topic/:topicName"
        render={({ match }) => <TopicView topicName={match.params.topicName} />}
      />
    </Switch>
  );
};
