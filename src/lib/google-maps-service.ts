// Google Maps service for geocoding and location services

interface GoogleMapsConfig {
  apiKey: string;
  enabled: boolean;
  geocodingEnabled: boolean;
  placesEnabled: boolean;
  directionsEnabled: boolean;
  mapsEnabled: boolean;
}

interface GeocodingResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  components: {
    city?: string;
    region?: string;
    country?: string;
  };
}

interface ReverseGeocodingResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  city?: string;
  region?: string;
  country?: string;
}

class GoogleMapsService {
  private config: GoogleMapsConfig | null = null;
  private fallbackEnabled = true;

  async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/settings/google-maps', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.config = data.config;
      }
    } catch (error) {
      console.error('Failed to load Google Maps config:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }
  }

  private isEnabled(): boolean {
    return this.config?.enabled && !!this.config?.apiKey;
  }

  private isGeocodingEnabled(): boolean {
    return this.isEnabled() && this.config?.geocodingEnabled;
  }

  // Geocoding: Convert address to coordinates
  async geocode(address: string): Promise<GeocodingResult | null> {
    await this.ensureInitialized();

    if (this.isGeocodingEnabled()) {
      try {
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.config!.apiKey}`;
        
        const response = await fetch(geocodingUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          const location = result.geometry.location;
          
          // Extract address components
          const components: any = {};
          result.address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              components.city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
              components.region = component.long_name;
            } else if (component.types.includes('country')) {
              components.country = component.long_name;
            }
          });

          return {
            address,
            coordinates: {
              lat: location.lat,
              lng: location.lng
            },
            formattedAddress: result.formatted_address,
            components
          };
        } else {
          console.warn('Google Maps geocoding failed:', data.status, data.error_message);
        }
      } catch (error) {
        console.error('Google Maps geocoding error:', error);
      }
    }

    // Fallback to free service
    if (this.fallbackEnabled) {
      return this.fallbackGeocode(address);
    }

    return null;
  }

  // Reverse Geocoding: Convert coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null> {
    await this.ensureInitialized();

    if (this.isGeocodingEnabled()) {
      try {
        const reverseGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.config!.apiKey}`;
        
        const response = await fetch(reverseGeocodingUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          
          // Extract address components
          let city = '';
          let region = '';
          let country = '';
          
          result.address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
              region = component.long_name;
            } else if (component.types.includes('country')) {
              country = component.long_name;
            }
          });

          return {
            coordinates: { lat, lng },
            address: result.formatted_address,
            city,
            region,
            country
          };
        } else {
          console.warn('Google Maps reverse geocoding failed:', data.status, data.error_message);
        }
      } catch (error) {
        console.error('Google Maps reverse geocoding error:', error);
      }
    }

    // Fallback to free service
    if (this.fallbackEnabled) {
      return this.fallbackReverseGeocode(lat, lng);
    }

    return null;
  }

  // Fallback geocoding using free service
  private async fallbackGeocode(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          address,
          coordinates: {
            lat: data.latitude,
            lng: data.longitude
          },
          formattedAddress: data.localityInfo?.administrative?.[0]?.name || address,
          components: {
            city: data.city,
            region: data.principalSubdivision,
            country: data.countryName
          }
        };
      }
    } catch (error) {
      console.error('Fallback geocoding error:', error);
    }
    
    return null;
  }

  // Fallback reverse geocoding using free service
  private async fallbackReverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.city && data.principalSubdivision) {
        return {
          coordinates: { lat, lng },
          address: data.localityInfo?.administrative?.[0]?.name || `${data.city}, ${data.principalSubdivision}`,
          city: data.city,
          region: data.principalSubdivision,
          country: data.countryName
        };
      }
    } catch (error) {
      console.error('Fallback reverse geocoding error:', error);
    }
    
    return null;
  }

  // Get directions between two points
  async getDirections(origin: string, destination: string): Promise<any> {
    await this.ensureInitialized();

    if (this.isEnabled() && this.config?.directionsEnabled) {
      try {
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.config.apiKey}`;
        
        const response = await fetch(directionsUrl);
        const data = await response.json();
        
        if (data.status === 'OK') {
          return data;
        } else {
          console.warn('Google Maps directions failed:', data.status, data.error_message);
        }
      } catch (error) {
        console.error('Google Maps directions error:', error);
      }
    }

    return null;
  }

  // Search for places
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<any> {
    await this.ensureInitialized();

    if (this.isEnabled() && this.config?.placesEnabled) {
      try {
        let placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.config.apiKey}`;
        
        if (location) {
          placesUrl += `&location=${location.lat},${location.lng}&radius=50000`;
        }
        
        const response = await fetch(placesUrl);
        const data = await response.json();
        
        if (data.status === 'OK') {
          return data;
        } else {
          console.warn('Google Maps places search failed:', data.status, data.error_message);
        }
      } catch (error) {
        console.error('Google Maps places search error:', error);
      }
    }

    return null;
  }

  // Get current configuration
  getConfig(): GoogleMapsConfig | null {
    return this.config;
  }

  // Update configuration
  async updateConfig(newConfig: Partial<GoogleMapsConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig } as GoogleMapsConfig;
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
export { GoogleMapsService };
export default googleMapsService;
