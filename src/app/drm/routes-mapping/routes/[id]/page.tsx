'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/toast-context';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  Route, 
  Truck, 
  Package, 
  Navigation,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  MessageSquare,
  Mail,
  Send
} from 'lucide-react';

interface Route {
  id: string;
  name: string;
  zone: {
    id: string;
    name: string;
    color: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
  };
  waypoints: any[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  deliveries: Array<{
    id: string;
    sequence: number;
    status: string;
    scheduledAt: string;
    distributor: {
      id: string;
      businessName: string;
      city: string;
      region: string;
      latitude?: number;
      longitude?: number;
    };
  }>;
}

export default function RouteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { success: showSuccess, error: showError } = useToast();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      loadRoute();
      loadGoogleMapsApiKey();
    }
  }, [status, params.id]);

  const loadRoute = async () => {
    try {
      const response = await fetch(`/api/drm/routes/${params.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoute(data.data);
      } else {
        const errorData = await response.json();
        console.error('Failed to load route:', errorData.error);
      }
    } catch (error) {
      console.error('Error loading route:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleMapsApiKey = async () => {
    try {
      const response = await fetch('/api/settings/google-maps', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const apiKey = data.config?.apiKey || '';
        console.log('Google Maps API key loaded:', apiKey ? 'Yes' : 'No');
        setGoogleMapsApiKey(apiKey);
      } else {
        console.error('Failed to load Google Maps config');
      }
    } catch (error) {
      console.error('Error loading Google Maps API key:', error);
    }
  };

  const initializeMap = () => {
    console.log('initializeMap called:', { googleMapsApiKey: !!googleMapsApiKey, route: !!route, mapLoaded });
    
    if (!googleMapsApiKey || !route || mapLoaded) return;

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded, creating map');
      createMap();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Script already exists, waiting for load');
      existingScript.addEventListener('load', createMap);
      return;
    }

    console.log('Loading Google Maps script...');
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      createMap();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
    };
    
    document.head.appendChild(script);
  };

  const createMap = () => {
    console.log('createMap called');
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      // Initialize map
      const mapElement = document.getElementById('map');
      console.log('Map element found:', !!mapElement);
      console.log('Google Maps available:', !!(window.google && window.google.maps));
      
      if (mapElement && window.google && window.google.maps) {
        try {
          const googleMap = new google.maps.Map(mapElement, {
            zoom: 12,
            center: { lat: 5.6037, lng: -0.1870 }, // Default to Accra
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          console.log('Map created successfully');
          setMap(googleMap);
          setMapLoaded(true);
          
          // Add markers for delivery stops
          addDeliveryMarkers(googleMap);
        } catch (error) {
          console.error('Error creating map:', error);
        }
      } else {
        console.error('Cannot create map - missing element or Google Maps API');
        console.log('Retrying in 1 second...');
        // Retry once more
        setTimeout(() => {
          const retryElement = document.getElementById('map');
          if (retryElement && window.google && window.google.maps) {
            try {
              const googleMap = new google.maps.Map(retryElement, {
                zoom: 12,
                center: { lat: 5.6037, lng: -0.1870 },
                mapTypeId: google.maps.MapTypeId.ROADMAP
              });
              console.log('Map created on retry');
              setMap(googleMap);
              setMapLoaded(true);
              addDeliveryMarkers(googleMap);
            } catch (error) {
              console.error('Error creating map on retry:', error);
            }
          }
        }, 1000);
      }
    }, 100);
  };

  const addDeliveryMarkers = (googleMap: google.maps.Map) => {
    if (!route || !route.deliveries) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;
    const validDeliveries = route.deliveries.filter(delivery => 
      delivery.distributor.latitude && delivery.distributor.longitude
    );

    // Optimize route using Google Maps Directions API
    if (validDeliveries.length > 1) {
      optimizeRoute(googleMap, validDeliveries);
    } else {
      // Single delivery or no valid coordinates - just show markers
      validDeliveries.forEach((delivery, index) => {
        const position = {
          lat: delivery.distributor.latitude,
          lng: delivery.distributor.longitude
        };

        const sequence = delivery.sequence || (index + 1);
        const marker = new google.maps.Marker({
          position,
          map: googleMap,
          title: `${sequence}. ${delivery.distributor.businessName}`,
          label: sequence.toString()
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${sequence}. ${delivery.distributor.businessName}</h3>
              <p class="text-sm text-gray-600">${delivery.distributor.city}, ${delivery.distributor.region}</p>
              <p class="text-xs text-gray-500">Status: ${delivery.status}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMap, marker);
        });

        bounds.extend(position);
        hasValidCoordinates = true;
      });

      if (hasValidCoordinates) {
        googleMap.fitBounds(bounds);
      }
    }
  };

  const optimizeRoute = (googleMap: google.maps.Map, deliveries: any[]) => {
    const waypoints = deliveries.map(delivery => ({
      location: new google.maps.LatLng(delivery.distributor.latitude, delivery.distributor.longitude),
      stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeWeight: 4
      }
    });

    directionsRenderer.setMap(googleMap);

    const request = {
      origin: waypoints[0].location,
      destination: waypoints[waypoints.length - 1].location,
      waypoints: waypoints.slice(1, -1),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        
        // Add custom markers for each stop
        const route = result.routes[0];
        route.legs.forEach((leg, legIndex) => {
          const delivery = deliveries[legIndex];
          const sequence = delivery.sequence || (legIndex + 1);
          
          const marker = new google.maps.Marker({
            position: leg.start_location,
            map: googleMap,
            title: `${sequence}. ${delivery.distributor.businessName}`,
            label: sequence.toString(),
            icon: {
              url: `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`,
              scaledSize: new google.maps.Size(32, 32)
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${sequence}. ${delivery.distributor.businessName}</h3>
                <p class="text-sm text-gray-600">${delivery.distributor.city}, ${delivery.distributor.region}</p>
                <p class="text-xs text-gray-500">Status: ${delivery.status}</p>
                <p class="text-xs text-gray-500">Distance: ${leg.distance?.text || 'N/A'}</p>
                <p class="text-xs text-gray-500">Duration: ${leg.duration?.text || 'N/A'}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(googleMap, marker);
          });
        });
      } else {
        console.error('Directions request failed:', status);
        // Fallback to simple markers
        addSimpleMarkers(googleMap, deliveries);
      }
    });
  };

  const addSimpleMarkers = (googleMap: google.maps.Map, deliveries: any[]) => {
    const bounds = new google.maps.LatLngBounds();
    
    deliveries.forEach((delivery, index) => {
      const position = {
        lat: delivery.distributor.latitude,
        lng: delivery.distributor.longitude
      };

      const sequence = delivery.sequence || (index + 1);
      const marker = new google.maps.Marker({
        position,
        map: googleMap,
        title: `${sequence}. ${delivery.distributor.businessName}`,
        label: sequence.toString()
      });

      bounds.extend(position);
    });

    googleMap.fitBounds(bounds);
  };

  // Initialize map when API key and route are available
  useEffect(() => {
    if (googleMapsApiKey && route && !mapLoaded) {
      initializeMap();
    }
  }, [googleMapsApiKey, route, mapLoaded]);

  const sendRouteToDriver = async (type: 'sms' | 'email') => {
    if (!route || !route.driver) return;

    if (type === 'sms') {
      setSendingSMS(true);
    } else {
      setSendingEmail(true);
    }

    try {
      const message = `Route: ${route.name}
Date: ${formatDate(route.scheduledDate)}
Stops: ${route.deliveries.length}
Distance: ${route.totalDistance.toFixed(1)}km
Duration: ${Math.floor(route.estimatedDuration / 60)}h ${route.estimatedDuration % 60}m
Check system for details.`;

      const response = await fetch(`/api/communication/${type}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipients: type === 'sms' ? [route.driver.phone] : [route.driver.email],
          subject: type === 'email' ? `Route Assignment: ${route.name}` : undefined,
          message: message,
          routeId: route.id,
          isBulk: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(`${type.toUpperCase()} sent successfully to ${route.driver.name}!`);
      } else {
        const errorData = await response.json();
        showError(`Failed to send ${type.toUpperCase()}: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error sending ${type.toUpperCase()}:`, error);
      showError(`Failed to send ${type.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (type === 'sms') {
        setSendingSMS(false);
      } else {
        setSendingEmail(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-yellow-600" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading route details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!route) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Route not found</p>
            <Button 
              onClick={() => router.push('/drm/routes-mapping')}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Routes
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/drm/routes-mapping')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{route.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: route.zone.color }}
                  />
                  <span className="text-sm text-gray-600">{route.zone.name}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                  {route.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Send to Driver Actions */}
          {route.driver && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => sendRouteToDriver('sms')}
                disabled={sendingSMS}
                variant="outline"
                size="sm"
              >
                {sendingSMS ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Send SMS
              </Button>
              <Button
                onClick={() => sendRouteToDriver('email')}
                disabled={sendingEmail}
                variant="outline"
                size="sm"
              >
                {sendingEmail ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Email
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Route Map</h2>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {route.totalDistance.toFixed(1)} km • {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                  </span>
                </div>
              </div>
              
              {/* Map Container */}
              <div className="h-96 bg-gray-100 rounded-lg relative">
                {!googleMapsApiKey ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Google Maps API key not configured</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Please configure your Google Maps API key in settings
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading map...</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Initializing Google Maps
                          </p>
                        </div>
                      </div>
                    )}
                    <div id="map" className="w-full h-full rounded-lg"></div>
                  </>
                )}
              </div>

              {/* Route Summary */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Route Summary</p>
                    <p className="text-xs text-blue-700">
                      {route.deliveries.length} stops • Scheduled for {formatDate(route.scheduledDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-900">
                      {route.deliveries.filter(d => d.status === 'delivered').length} / {route.deliveries.length} completed
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Route Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Distance</span>
                  </div>
                  <span className="font-semibold">{route.totalDistance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Estimated Duration</span>
                  </div>
                  <span className="font-semibold">
                    {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Delivery Stops</span>
                  </div>
                  <span className="font-semibold">{route.deliveries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Scheduled Date</span>
                  </div>
                  <span className="font-semibold text-sm">{formatDate(route.scheduledDate)}</span>
                </div>
              </div>
            </Card>

            {/* Driver Information */}
            {route.driver && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{route.driver.name}</p>
                      <p className="text-sm text-gray-600">{route.driver.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{route.driver.vehicleType}</p>
                      <p className="text-sm text-gray-600">{route.driver.vehiclePlate}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Delivery Stops */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Stops</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {route.deliveries
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((delivery) => (
                  <div key={delivery.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-800">{delivery.sequence}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{delivery.distributor.businessName}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {delivery.distributor.city}, {delivery.distributor.region}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getDeliveryStatusIcon(delivery.status)}
                      <span className="text-xs text-gray-500">
                        {formatTime(delivery.scheduledAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
