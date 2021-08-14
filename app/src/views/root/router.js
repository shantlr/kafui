import { Redirect, Route, Switch } from 'react-router-dom';

import { ClusterView } from 'views/cluster';
import { ConsumerGroupView } from 'views/consumerGroup';
import { TopicView } from 'views/topic';

export const Router = () => {
  return (
    <Switch>
      <Route
        path="/topic/:topicName"
        render={({ match }) => <TopicView topicName={match.params.topicName} />}
      />
      <Route
        path="/group/:groupId"
        render={({ match }) => (
          <ConsumerGroupView groupId={match.params.groupId} />
        )}
      />
      <Route path="/cluster" exact component={ClusterView} />
      <Redirect to="/cluster" />
    </Switch>
  );
};
