'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Bus, 
  Plus, 
  Edit, 
  Trash2, 
  Navigation, 
  Clock, 
  User, 
  Phone,
  Route,
  Radio,
  AlertTriangle,
  RefreshCw,
  Car
} from 'lucide-react';
import { busService } from '@/services/busService';
import { Bus as BusType, BusLocation, BusRoute } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function BusTrackingPage() {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data
      const [locationsData, busesData, routesData] = await Promise.allSettled([
        busService.getBusLocations(),
        user?.role === 'admin' ? busService.getBuses() : Promise.resolve({ data: [] }),
        user?.role === 'admin' ? busService.getBusRoutes() : Promise.resolve({ data: [] })
      ]);

      // Handle locations data
      if (locationsData.status === 'fulfilled') {
        setBusLocations(locationsData.value);
      } else {
        console.error('Failed to fetch bus locations:', locationsData.reason);
        toast({
          title: "Error",
          description: "Failed to load bus locations",
          variant: "destructive"
        });
      }

      // Handle buses data
      if (busesData.status === 'fulfilled') {
        // Check if data is an array or paginated response
        let busesArray: BusType[] = [];
        if (Array.isArray(busesData.value.data)) {
          busesArray = busesData.value.data;
        } else if (busesData.value.data && typeof busesData.value.data === 'object' && 'data' in busesData.value.data) {
          busesArray = busesData.value.data.data;
        }
        setBuses(busesArray);
      } else if (user?.role === 'admin') {
        console.error('Failed to fetch buses:', busesData.reason);
        toast({
          title: "Error",
          description: "Failed to load buses",
          variant: "destructive"
        });
      }

      // Handle routes data
      if (routesData.status === 'fulfilled') {
        // Check if data is an array or paginated response
        let routesArray: BusRoute[] = [];
        if (Array.isArray(routesData.value.data)) {
          routesArray = routesData.value.data;
        } else if (routesData.value.data && typeof routesData.value.data === 'object' && 'data' in routesData.value.data) {
          routesArray = routesData.value.data.data;
        }
        setBusRoutes(routesArray);
      } else if (user?.role === 'admin') {
        console.error('Failed to fetch routes:', routesData.reason);
        toast({
          title: "Error",
          description: "Failed to load bus routes",
          variant: "destructive"
        });
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching bus data:', err);
      setError('Failed to load bus data. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load bus data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'maintenance':
        return <Badge variant="warn">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getBusLocation = (busId: string) => {
    return busLocations
      .filter(loc => loc.bus_id === busId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const getBusRoute = (routeId: string) => {
    return busRoutes.find(route => route.id === routeId);
  };

  // Simple map visualization component
  const BusMap = () => {
    const selectedBusData = buses.find(b => b.id === selectedBus);
    const selectedLocation = selectedBusData ? getBusLocation(selectedBusData.id) : null;
    
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Simple road lines */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2"></div>
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2"></div>
          
          {/* Bus stops */}
          <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Buses */}
          {busLocations.map((location, index) => {
            const bus = buses.find(b => b.id === location.bus_id);
            if (!bus) return null;
            
            // Simple positioning based on lat/lng (for demo purposes)
            const positionX = (location.longitude % 1) * 100;
            const positionY = (location.latitude % 1) * 100;
            
            return (
              <div 
                key={location.id}
                className={`absolute w-8 h-8 rounded flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedBus === bus.id ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-2 border-blue-600'
                }`}
                style={{ left: `${positionX}%`, top: `${positionY}%` }}
                onClick={() => setSelectedBus(bus.id === selectedBus ? null : bus.id)}
              >
                <Bus className="w-4 h-4" />
              </div>
            );
          })}
          
          {/* Selected bus indicator */}
          {selectedLocation && (
            <div 
              className="absolute w-12 h-12 rounded-full bg-blue-500 bg-opacity-20 animate-ping"
              style={{ 
                left: `${(selectedLocation.longitude % 1) * 100}%`, 
                top: `${(selectedLocation.latitude % 1) * 100}%` 
              }}
            ></div>
          )}
        </div>
        
        {!busLocations.length && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>No bus locations available</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBusDetails = () => {
    const bus = buses.find(b => b.id === selectedBus);
    const latestLocation = getBusLocation(selectedBus!);

    if (!bus || !latestLocation) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Bus className="w-12 h-12 mx-auto mb-2" />
          <p>Select a bus to view details</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{bus.bus_number}</h3>
              <p className="text-sm text-muted-foreground">{bus.license_plate}</p>
            </div>
          </div>
          {getStatusBadge(bus.status)}
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <User className="mr-1 h-4 w-4" />
            {bus.driver_name || 'No driver assigned'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Phone className="mr-1 h-4 w-4" />
            {bus.driver_phone || 'No phone'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Route className="mr-1 h-4 w-4" />
            Capacity: {bus.capacity || 'N/A'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Navigation className="mr-1 h-4 w-4" />
            Updated: {new Date(latestLocation.timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3" />
          <span>
            {latestLocation.latitude.toFixed(6)}, {latestLocation.longitude.toFixed(6)}
          </span>
        </div>
      </div>
    );
  };

  const renderRouteInfo = () => {
    const bus = buses.find(b => b.id === selectedBus);
    if (!bus) return null;
    
    const route = bus.route_id ? getBusRoute(bus.route_id) : null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Route Details</h3>
              <p className="text-sm text-muted-foreground">{route?.name || 'No route assigned'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Start Time: {bus.start_time || 'N/A'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            End Time: {bus.end_time || 'N/A'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            Start: {bus.start_location || route?.start_location || 'N/A'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            End: {bus.end_location || route?.end_location || 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Bus Tracking</h1>
            <p className="text-muted-foreground">
              Monitor school buses in real-time
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <Button onClick={fetchData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bus Tracking</h1>
            <p className="text-muted-foreground">
              Monitor school buses in real-time
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Radio className="mr-1 h-4 w-4" />
              Live
            </div>
            <div className="text-sm text-muted-foreground">
              Last update: {lastUpdate || 'Never'}
            </div>
            <Button onClick={async () => { setLoading(true); await fetchData(); }} variant="outline" size="sm" loading={loading} loadingText="Refreshing...">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Bus
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bus List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="mr-2 h-5 w-5" />
                School Buses
              </CardTitle>
              <CardDescription>
                List of all registered school buses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {buses.length > 0 ? (
                    buses.map((bus) => {
                      const latestLocation = getBusLocation(bus.id);
                      return (
                        <div 
                          key={bus.id} 
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedBus === bus.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedBus(bus.id === selectedBus ? null : bus.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Bus className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{bus.bus_number}</h3>
                                <p className="text-sm text-muted-foreground">{bus.license_plate}</p>
                              </div>
                            </div>
                            {getStatusBadge(bus.status)}
                          </div>
                          
                          {latestLocation && (
                            <>
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                  <User className="mr-1 h-4 w-4" />
                                  {bus.driver_name || 'No driver'}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Navigation className="mr-1 h-4 w-4" />
                                  {new Date(latestLocation.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              
                              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                <MapPin className="mr-1 h-3 w-3" />
                                <span>
                                  {latestLocation.latitude.toFixed(4)}, {latestLocation.longitude.toFixed(4)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="w-12 h-12 mx-auto mb-2" />
                      <p>No buses registered</p>
                      {user?.role === 'admin' && (
                        <Button className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Bus
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Map and Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="mr-2 h-5 w-5" />
                  Live Map
                </CardTitle>
                <CardDescription>
                  Real-time bus locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusMap />
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bus className="mr-2 h-5 w-5" />
                    Bus Details
                  </CardTitle>
                  <CardDescription>
                    Selected bus information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBusDetails()}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Route className="mr-2 h-5 w-5" />
                    Route Information
                  </CardTitle>
                  <CardDescription>
                    Assigned route details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedBus ? (
                    renderRouteInfo()
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Route className="w-12 h-12 mx-auto mb-2" />
                      <p>Select a bus to view route</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}