import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { HttpLink, ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
    uri: process.env.REACT_APP_BASE_URL,
    credentials: 'include',
});

const wsLink = new GraphQLWsLink(createClient({
    url: process.env.REACT_APP_WS_URL,
    connectionParams: () => {
        return {};
    }
}));

const splitLink = ApolloLink.split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink
);

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
      // @ts-ignore - 
    connectToDevTools: true, 
});
