import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';

import { apolloClient } from 'apollo';
import { styles } from 'styles';
import { themes } from 'styles/theme';
import { MainSideBar } from 'views/sideBar';

import { Router } from './router';

const RootContainer = styled.div`
  ${themes.main}

  height: 100vh;
  width: 100vw;
`;

const PageContainer = styled.div`
  ${styles.container}
  flex-direction: row;
`;

export const RootApp = () => {
  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <RootContainer>
          <PageContainer>
            <MainSideBar />
            <Router />
          </PageContainer>
        </RootContainer>
      </ApolloProvider>
    </BrowserRouter>
  );
};
