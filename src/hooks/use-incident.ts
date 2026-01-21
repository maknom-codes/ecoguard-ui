import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";


const GET_ALL_INCIDENTS = gql`
    query GetIncidents {
    getIncidents {
        id
        description
        category
        reportDate
        urgency
        geometry
        zoneId
        userId
    }
}
`;


export function useIncidents(): { incidents: any, loading: boolean, error: any } {
    
    const { data, loading, error } = useQuery<{ getIncidents: any }>(GET_ALL_INCIDENTS);
    
    return {
        incidents: data?.getIncidents,
        loading,
        error
    };

}

