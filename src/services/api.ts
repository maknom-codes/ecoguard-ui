

export class GraphQLClient {

    private baseURL: string;

    constructor() {
        this.baseURL = process.env.REACT_APP_BASE_URL;
    };

    public async graphqlRequest<T>(query: string, variables = {}): Promise<T> {
        const token = localStorage.getItem('token'); 
    
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({ query, variables })
        });
    
        const result = await response.json();
    
        if (result.errors) {
            console.error('Erreur GraphQL:', result.errors);
            throw new Error(result.errors[0].message);
        }
    
        return result.data;
    };

    public async execute<T>(query: string, variables?: Record<string, any>, type?: string): Promise<T> {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                variables,
                type
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        if (result.errors) {
            console.error('Erreur GraphQL:', result.errors);
            throw new Error(result.errors[0].message);
        }
    
        return result.data;
    }

} 


