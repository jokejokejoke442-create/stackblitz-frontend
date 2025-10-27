'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Bus, 
  Play, 
  Square, 
  Navigation, 
  Clock, 
  User, 
  Phone,
  Route
} from 'lucide-react';
import { driverTrackingService } from '@/services/driverTrackingService';
import { useAuth } from '@/hooks/useAuth';

export default function DriverDashboardPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [shiftStatus, setShiftStatus] = useState<'off-duty' | 'on-duty'>('off-duty');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Get user's current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        setError(null);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
      }
    );
  };

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        setError(null);
        
        // Send location to server
        driverTrackingService.updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy
        }).catch(err => {
          console.error('Failed to send location:', err);
        });
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );

    setWatchId(id);
    setIsTracking(true);
  };

  // Stop tracking location
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  };

  // Start shift
  const startShift = async () => {
    try {
      await driverTrackingService.startShift();
      setShiftStatus('on-duty');
    } catch (err) {
      setError('Failed to start shift');
      console.error(err);
    }
  };

  // End shift
  const endShift = async () => {
    try {
      await driverTrackingService.endShift();
      setShiftStatus('off-duty');
      stopTracking();
    } catch (err) {
      setError('Failed to end shift');
      console.error(err);
    }
  };

  // Get initial location
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            Track your bus location and manage your shift
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={shiftStatus === 'on-duty' ? 'default' : 'secondary'}>
            {shiftStatus === 'on-duty' ? 'On Duty' : 'Off Duty'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bus Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bus className="mr-2 h-5 w-5" />
              Assigned Bus
            </CardTitle>
            <CardDescription>
              Details of your assigned bus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Bus #{user?.assignedBusId?.slice(0, 8) || 'N/A'}</h3>
                    <p className="text-sm text-muted-foreground">License: {user?.licenseNumber || 'N/A'}</p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <User className="mr-1 h-4 w-4" />
                  Driver ID: {user?.driverId?.slice(0, 8) || 'N/A'}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-1 h-4 w-4" />
                  Contact: {user?.phone || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Location Tracking
            </CardTitle>
            <CardDescription>
              Real-time GPS tracking status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">
                    {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
                  </span>
                </div>
                <Badge variant={isTracking ? 'default' : 'secondary'}>
                  {isTracking ? 'Live' : 'Offline'}
                </Badge>
              </div>
              
              {location ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Navigation className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Lat: {location.coords.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Lng: {location.coords.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  {location.coords.speed !== null && (
                    <div className="flex items-center">
                      <Route className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Speed: {location.coords.speed.toFixed(2)} m/s</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {error ? error : 'Getting location...'}
                </div>
              )}
              
              <div className="flex space-x-2 pt-2">
                {!isTracking ? (
                  <Button onClick={startTracking} className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Start Tracking
                  </Button>
                ) : (
                  <Button onClick={stopTracking} variant="destructive" className="w-full">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Tracking
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Management */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
          <CardDescription>
            Start or end your driving shift
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {shiftStatus === 'off-duty' ? (
              <Button onClick={startShift}>
                <Play className="mr-2 h-4 w-4" />
                Start Shift
              </Button>
            ) : (
              <Button onClick={endShift} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                End Shift
              </Button>
            )}
            
            <div className="flex-1 text-sm text-muted-foreground">
              {shiftStatus === 'on-duty' 
                ? 'Your shift is currently active. Location tracking is enabled.' 
                : 'Your shift is currently inactive. Start your shift to begin location tracking.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Start your shift when you begin driving</p>
            <p>2. Ensure location tracking is enabled while driving</p>
            <p>3. End your shift when you finish driving</p>
            <p>4. Keep this tab open to maintain tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}