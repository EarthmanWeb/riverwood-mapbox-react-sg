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

  private generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return slug;
  }

  public async loadMockData(): Promise<PropertyData[]> {
    try {
      this.mockData = propertiesData.properties.map((property, index) => ({
        ...property,
        id: property.id || `property-${index}`,
        slug: this.generateSlug(property.title)
      }));
      return this.mockData;
    } catch (error) {
      console.error('Error loading mock data:', error);
      return [];
    }
  }

  public findPropertyBySlug(slug: string): PropertyData | undefined {
    // Add early return if data isn't loaded
    if (this.mockData.length === 0) {
      console.warn('Attempting to find property before data is loaded');
      return undefined;
    }

    const property = this.mockData.find(
      property => this.generateSlug(property.title) === slug
    );
    
    console.log('Property lookup result:', {
      slug,
      found: !!property,
      title: property?.title
    });
    
    return property;
  }

  public getGeoJsonFeatures(): GeoJsonFeature[] {
    return this.mockData.map(property => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(property.lng), Number(property.lat)]
      },
      properties: {
        ...property,
        tenants: property.tenants, // Don't stringify
        coordinates: [Number(property.lng), Number(property.lat)]
      }
    }));
  }

  public getData(): PropertyData[] {
    return this.mockData;
  }
}
