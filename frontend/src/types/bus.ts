export interface Bus {
  end_location: string | undefined;
  start_location: string | undefined;
  route_id: string | undefined;
  end_time: string;
  start_time: string;
  id: string;
  organization_id: string;
  bus_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  capacity?: number;
  driver_name?: string;
  driver_phone?: string;
  driver_license_number?: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface BusRoute {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  start_location?: string;
  end_location?: string;
  waypoints?: Array<{
    latitude: number;
    longitude: number;
    name?: string;
  }>;
  distance?: number;
  estimated_duration?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  bus_stops?: BusStop[];
}

export interface BusStop {
  id: string;
  organization_id: string;
  route_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  arrival_time?: string;
  departure_time?: string;
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface BusLocation {
  id: string;
  bus_id: string;
  organization_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  timestamp: string;
  buses?: {
    bus_number: string;
    license_plate: string;
    driver_name?: string;
  };
}

export interface StudentBusAssignment {
  id: string;
  student_id: string;
  organization_id: string;
  bus_id: string;
  route_id: string;
  stop_id: string;
  assigned_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  students?: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
  buses?: {
    bus_number: string;
    license_plate: string;
    driver_name?: string;
  };
  bus_routes?: {
    name: string;
  };
  bus_stops?: {
    name: string;
  };
}