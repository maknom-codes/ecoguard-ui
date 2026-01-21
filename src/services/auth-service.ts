import { GraphQLClient } from "./api"
import { apolloClient } from "./apollo-client"

interface ILoginResponse {
    login: {
        success: boolean,
        message: string,
        user: {
            id: number,
            name: string,
            email: string,
            role: string
        }
    }
};



export const authService = {
    register: async (userRequest: { name: string, email: string, password: string, role: string} ): Promise<{ register: any }> => {
        const apiClient = new GraphQLClient();
        const mutation = `
            mutation Register($user: RegisterInput!) {
                register(userRequest: $user) { success message user { id } }
            }
        `
        return apiClient.execute(mutation, { user: userRequest});
    },
   handleLogin: async (email: string, password: string): Promise<ILoginResponse> => {
        const apiClient = new GraphQLClient();
        const mutation = `
            mutation login($email: String!, $password: String!) {
                login(email: $email, password: $password) { success message }
            }
        `
        return apiClient.execute(mutation, { email, password } );
    },
    refreshToken: async () : Promise<{refreshToken: { success: boolean, message: string }}> => {
        const apiClient = new GraphQLClient();
        const mutation =`
            mutation RefreshToken {
                refreshToken { success message }
            }
        `;
        return apiClient.execute(mutation);
    },
    logout: async () : Promise<{logout: { success: boolean, message: string }}> => {
        const apiClient = new GraphQLClient();
        const mutation =`
            mutation Logout {
                logout { success message }
            }
        `;
        await apolloClient.clearStore();
        return await apiClient.execute(mutation);
    },
    checkAuth: async () : Promise<{ authCheck: { authenticated: boolean, username: string, expriredAt: string, mesage: string }}> => {
        const apiClient = new GraphQLClient();
        const mutation =`
            mutation CheckAuth {
                authCheck { authenticated username expiredAt message }
            }
        `;
        return apiClient.execute(mutation);
    },
    syncOfflineData: async (items: any[]): Promise<{ syncOfflineData: {success: boolean, syncedIds: number[], failedIds: number[], message: string}}> => {
        const apiClient = new GraphQLClient();
        const mutation = `
            mutation SyncOfflineData($items: [SyncItemInput!]!) {
                syncOfflineData(items: $items) {
                    success
                    syncedIds
                    failedIds
                    message
                }
            }
        `;
        return apiClient.execute(mutation, { items });
    }
}