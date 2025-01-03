import propertiesData from '../data/properties.json';

export interface PropertyData {
  id: string; // Add an ID field
  title: string;
  image: string;
  lat: string;
  lng: string;
  display_address: string;
  map_address: string;
  description: string;
  downloads: Record<string, string>;
  images: Record<string, string>;
  city: string;
  state: string;
  zipcode: string;
  trafficCount: number;
  type: 'Gas Station' | 'Industrial' | 'Garage Service' | 'Land' | 'Medical/Office' | 
        'New Construction' | 'Restaurant' | 'Retail Centers' | 'Warehouse';
  status: 'leased' | 'available' | 'for-lease' | 'for-sale';
  features: Array<'drive-thru' | 'grease-trap' | 'hair-nail-salon-available' | 
           'hair-salon-available' | 'nail-salon-available' | 'trash-included-in-cam' | 
           'water-included-in-cam'>;
  demographics: Array<{
    type: string;
    oneMile: number;
    threeMile: number;
    fiveMile: number;
  }>;
  tenants: Array<{
    suite: string;
    price: number;
    units: number;
    size: number;
    description: string;
    available: boolean;
  }>;
  propertyManager: string;
  labels: Array<'ATM' | 'Development' | 'Industrial' | 'Land' | 'Medical' | 
          'New Construction' | 'Office' | 'Restaurant' | 'Retail' | 'Service'>;
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: Omit<PropertyData, 'lat' | 'lng'>;
}

export class MockDataService {
  private static instance: MockDataService;
  private mockData: PropertyData[] = [];

  private constructor() {}

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  public async loadMockData(): Promise<PropertyData[]> {
    try {
      this.mockData = propertiesData.properties.map((property, index) => ({
        ...property,
        id: property.id || `property-${index}` // Ensure each property has a unique ID
      }));
      return this.mockData;
    } catch (error) {
      console.error('Error loading mock data:', error);
      return [];
    }
  }

  public getGeoJsonFeatures(): GeoJsonFeature[] {
    return this.mockData.map(property => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(property.lng), Number(property.lat)]
      },
      properties: {
        id: property.id, // Include the ID in the properties
        title: property.title,
        image: property.image,
        display_address: property.display_address,
        status: property.status,
        tenants: JSON.stringify(property.tenants),
        type: property.type
      }
    }));
  }

  public getData(): PropertyData[] {
    return this.mockData;
  }
}
