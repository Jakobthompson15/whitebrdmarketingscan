import axios from 'axios';

export interface BusinessSuggestion {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  serviceType: string;
  location: {
    lat: number;
    lng: number;
  };
  publicInfo: {
    phone?: string;
    website?: string;
    hours?: any;
    photos: number;
    businessStatus: string;
    currentlyOpen?: boolean;
  };
}

export class GooglePlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "mock_key";
    
    if (this.apiKey === "mock_key") {
      console.log('🔧 Using mock Google Places service');
    } else {
      console.log('🌐 Using real Google Places API');
    }
  }

  async searchBusinesses(query: string): Promise<BusinessSuggestion[]> {
    // If no real API key, use mock data
    if (this.apiKey === "mock_key") {
      console.log('🔍 Mock searching for:', query);
      return this.getMockBusinesses(query);
    }

    console.log('🔍 Searching for businesses:', query);
    
    try {
      // Use Google Places API Text Search
      const searchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      const params = {
        query: `${query} home services`,
        key: this.apiKey,
        type: 'establishment',
        radius: 50000 // 50km radius
      };

      const response = await axios.get(searchUrl, { params });
      
      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', response.data.status);
        return this.getMockBusinesses(query);
      }

      const results = response.data.results || [];
      return this.processSearchResults(results.slice(0, 10));
      
    } catch (error) {
      console.error('Error searching businesses:', error);
      return this.getMockBusinesses(query);
    }
  }

  private getMockBusinesses(query: string): BusinessSuggestion[] {
    // Mock business suggestions based on query
    const mockBusinesses: BusinessSuggestion[] = [
      {
        placeId: 'mock_place_1',
        name: 'Elite HVAC Services',
        address: '123 Main St, Phoenix, AZ 85001',
        rating: 4.8,
        reviewCount: 127,
        serviceType: 'HVAC',
        location: { lat: 33.4484, lng: -112.0740 },
        publicInfo: {
          phone: '(555) 123-4567',
          website: 'https://elitehvac.com',
          hours: { open_now: true },
          photos: 15,
          businessStatus: 'OPERATIONAL',
          currentlyOpen: true
        }
      },
      {
        placeId: 'mock_place_2',
        name: 'Phoenix Plumbing Pro',
        address: '456 Oak Ave, Phoenix, AZ 85002',
        rating: 4.6,
        reviewCount: 89,
        serviceType: 'Plumbing',
        location: { lat: 33.4734, lng: -112.0431 },
        publicInfo: {
          phone: '(555) 234-5678',
          website: undefined,
          hours: { open_now: false },
          photos: 8,
          businessStatus: 'OPERATIONAL',
          currentlyOpen: false
        }
      },
      {
        placeId: 'mock_place_3',
        name: 'Desert Roofing Solutions',
        address: '789 Pine Rd, Phoenix, AZ 85003',
        rating: 4.9,
        reviewCount: 203,
        serviceType: 'Roofing',
        location: { lat: 33.5149, lng: -112.1001 },
        publicInfo: {
          phone: '(555) 345-6789',
          website: 'https://desertroof.com',
          hours: { open_now: true },
          photos: 25,
          businessStatus: 'OPERATIONAL',
          currentlyOpen: true
        }
      },
      {
        placeId: 'mock_place_4',
        name: 'Lightning Electric',
        address: '321 Elm St, Phoenix, AZ 85004',
        rating: 4.4,
        reviewCount: 56,
        serviceType: 'Electrical',
        location: { lat: 33.4255, lng: -112.0889 },
        publicInfo: {
          phone: '(555) 456-7890',
          website: 'https://lightningelectric.com',
          hours: { open_now: true },
          photos: 12,
          businessStatus: 'OPERATIONAL',
          currentlyOpen: true
        }
      },
      {
        placeId: 'mock_place_5',
        name: 'Green Valley Landscaping',
        address: '654 Cedar Ave, Phoenix, AZ 85005',
        rating: 4.7,
        reviewCount: 98,
        serviceType: 'Landscaping',
        location: { lat: 33.3962, lng: -112.0651 },
        publicInfo: {
          phone: '(555) 567-8901',
          website: undefined,
          hours: { open_now: false },
          photos: 18,
          businessStatus: 'OPERATIONAL',
          currentlyOpen: false
        }
      }
    ];

    // Filter based on query
    const filtered = mockBusinesses.filter(business => 
      business.name.toLowerCase().includes(query.toLowerCase()) ||
      business.serviceType.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.slice(0, 5);
  }

  private async processSearchResults(results: any[]): Promise<BusinessSuggestion[]> {
    const businesses: BusinessSuggestion[] = [];
    
    for (const result of results) {
      try {
        // Get additional details for each place
        const details = await this.getPlaceDetails(result.place_id);
        
        const serviceType = this.detectServiceType(result.name, result.types || []);
        
        // Only include home service businesses
        if (!this.isHomeServiceBusiness(serviceType)) {
          continue;
        }

        const business: BusinessSuggestion = {
          placeId: result.place_id,
          name: result.name,
          address: result.formatted_address || '',
          rating: result.rating || 0,
          reviewCount: result.user_ratings_total || 0,
          serviceType,
          location: {
            lat: result.geometry?.location?.lat || 0,
            lng: result.geometry?.location?.lng || 0
          },
          publicInfo: {
            phone: details.formatted_phone_number,
            website: details.website,
            hours: details.opening_hours,
            photos: (result.photos || []).length,
            businessStatus: result.business_status || 'OPERATIONAL',
            currentlyOpen: details.opening_hours?.open_now
          }
        };
        
        businesses.push(business);
        
      } catch (error) {
        console.error(`Error processing business ${result.name}:`, error);
        continue;
      }
    }
    
    return businesses;
  }

  private async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      const params = {
        place_id: placeId,
        key: this.apiKey,
        fields: 'formatted_phone_number,website,opening_hours'
      };

      const response = await axios.get(detailsUrl, { params });
      
      if (response.data.status === 'OK') {
        return response.data.result || {};
      }
      
      return {};
    } catch (error) {
      console.error('Error getting place details:', error);
      return {};
    }
  }

  private detectServiceType(name: string, types: string[]): string {
    const businessName = name.toLowerCase();
    
    if (businessName.includes('hvac') || businessName.includes('heating') || businessName.includes('cooling') || businessName.includes('air condition')) {
      return 'HVAC';
    }
    if (businessName.includes('plumb') || businessName.includes('pipe') || businessName.includes('drain')) {
      return 'Plumbing';
    }
    if (businessName.includes('roof') || businessName.includes('gutter') || businessName.includes('siding')) {
      return 'Roofing';
    }
    if (businessName.includes('pest') || businessName.includes('exterminat') || businessName.includes('termite')) {
      return 'Pest Control';
    }
    if (businessName.includes('electric') || businessName.includes('wiring')) {
      return 'Electrical';
    }
    if (businessName.includes('landscap') || businessName.includes('lawn') || businessName.includes('tree')) {
      return 'Landscaping';
    }
    if (businessName.includes('paint')) {
      return 'Painting';
    }
    if (businessName.includes('clean') || businessName.includes('maid') || businessName.includes('janitorial')) {
      return 'Cleaning';
    }

    // Check Google Places types
    if (types.includes('plumber')) return 'Plumbing';
    if (types.includes('electrician')) return 'Electrical';
    if (types.includes('roofing_contractor')) return 'Roofing';
    if (types.includes('general_contractor')) return 'General Contractor';
    
    return 'General Contractor';
  }

  private isHomeServiceBusiness(serviceType: string): boolean {
    const validServiceTypes = [
      'HVAC', 'Plumbing', 'Roofing', 'Pest Control', 'Electrical',
      'Landscaping', 'Painting', 'General Contractor', 'Cleaning'
    ];

    return validServiceTypes.includes(serviceType);
  }
}
