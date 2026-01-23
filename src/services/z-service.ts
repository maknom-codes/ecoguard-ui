import { IncidentFeatureCollection, ZoneFeatureCollection } from "../components/type";
import { GraphQLClient } from "./api";

export interface ProtectedZone {
    id: string,
    name: string,
    geoJson: string;
};

export interface IncidentZone {
    id: number
    description: string
    category: String
    reportDate: string
    urgency: string
    geometry: string
    zoneId: number
    userId: number
};

export interface IZone {
    success: boolean,
    protectedZones: ZoneFeatureCollection,
    incidentZones: IncidentFeatureCollection
}


export const zoneService = {
    getAllZones: async (): Promise<IZone> => {
        const apiGraphQL = new GraphQLClient();
        const query = `
        query Get { 
            getZones { 
                protectedZones {
                    type
                    features {
                        type
                        geometry {
                            type
                            coordinates
                        }
                        properties {
                            id
                            name
                        }
                    }
                } 
                incidentZones { 
                    type
                    features {
                        type
                        geometry {
                            type
                            coordinates
                        }
                        properties {
                            id
                            category
                            description
                            urgency
                            reportDate
                        }
                    } 
                }
            }
        }
        `;         
        const data = await apiGraphQL.execute<{ getZones: IZone }>(query);
        return data.getZones;

    },
    createProZone: async (name: string, coordinates: number[][]) => {
        const apiGraphQL = new GraphQLClient();
        const mutation = `
            mutation createProtectedZone($name: String!, $coordinates: [[Float]]!) {
                createProtectedZone(input: { name: $name, dataCoordinates: $coordinates }) { id name }
            }
        `
        return apiGraphQL.execute(mutation, { name, coordinates })
    },
    createIncident: async (data: any) => {
        const apiGraphQL = new GraphQLClient();
        const mutation = `
            mutation CreateIncident($description: String!, $category: String!, $latitude: Float!, $longitude: Float!, $urgency: String!) {
                createIncident(input: { 
                description: $description, 
                category: $category, 
                latitude: $latitude, 
                longitude: $longitude, 
                urgency: $urgency }) { id }
            }
        `
        return apiGraphQL.execute(mutation,  data )
    }
}