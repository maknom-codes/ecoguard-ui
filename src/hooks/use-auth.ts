import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_AUTH_STATUS_QUERY = gql`
  query GetStatus {
    authCheck {
      message
      authenticated
    }
  }
`;

export function useAuth() {
    const { data , loading, error } = useQuery<{ authCheck: any }>(GET_AUTH_STATUS_QUERY, {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
    });
    return {
        isAuthenticated: data?.authCheck?.authenticated,
        loading,
        error,
    }
};