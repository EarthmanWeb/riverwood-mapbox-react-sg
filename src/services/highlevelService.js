export class HighLevelService {
    constructor() {
        console.log('Initializing HighLevel service...');
        this.baseUrl = 'https://services.leadconnectorhq.com';
        this.defaultHeaders = {
            'Authorization': `Bearer ${import.meta.env.VITE_HIGHLEVEL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        };
    }

    async getProperties() {
        try {
            // Using the endpoint that worked previously
            const url = `${this.baseUrl}/objects/custom_objects.properties/?locationId=${import.meta.env.VITE_HIGHLEVEL_LOCATION_ID}`;
            console.log('Fetching properties from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            return this.mapProperties(data);
        } catch (error) {
            console.error('Error in getProperties:', error);
            return [];
        }
    }

    mapProperties(propertiesData) {
        return propertiesData.properties?.map(property => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [property.longitude, property.latitude]
            },
            properties: {
                name: property.name,
                address: property.address
            }
        })) || [];
    }
}

// ...existing code...
