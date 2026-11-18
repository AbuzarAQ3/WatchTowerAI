import type { Camera, CameraBox } from '../../types/domain';

export const INITIAL_CAMERAS: Camera[] = [
  { id: 1, name: 'Main Gate', zone: 'Entry', ip: '192.168.1.11', fps: 30, status: 'live' },
  { id: 2, name: 'North Fence', zone: 'Perimeter', ip: '192.168.1.12', fps: 25, status: 'live' },
  { id: 3, name: 'Parking Lot A', zone: 'Parking', ip: '192.168.1.13', fps: 15, status: 'live' },
  { id: 4, name: 'Canteen', zone: 'Interior', ip: '192.168.1.14', fps: 0, status: 'offline' },
  { id: 5, name: 'Library', zone: 'Interior', ip: '192.168.1.15', fps: 30, status: 'live' },
  { id: 6, name: 'Admin Block', zone: 'Restricted', ip: '192.168.1.16', fps: 30, status: 'live' },
  { id: 7, name: 'East Parking', zone: 'Parking', ip: '192.168.1.17', fps: 15, status: 'live' },
  { id: 8, name: 'Parking Lot B', zone: 'Parking', ip: '192.168.1.18', fps: 15, status: 'maintenance' },
];

export const CAMERA_FEEDS: Camera[] = [
  { id: 1, name: 'Main Gate', zone: 'Entry', ip: '192.168.1.11', fps: 30, status: 'live' },
  { id: 2, name: 'North Fence', zone: 'Perimeter', ip: '192.168.1.12', fps: 25, status: 'live' },
  { id: 3, name: 'Parking Lot A', zone: 'Parking', ip: '192.168.1.13', fps: 15, status: 'live' },
  { id: 4, name: 'Canteen', zone: 'Interior', ip: '192.168.1.14', fps: 0, status: 'offline' },
  { id: 5, name: 'Library', zone: 'Interior', ip: '192.168.1.15', fps: 30, status: 'live' },
  { id: 6, name: 'Admin Block', zone: 'Restricted', ip: '192.168.1.16', fps: 30, status: 'live' },
];

export const AI_BOXES: Record<string | number, CameraBox[]> = {
  1: [{ top: '30%', left: '45%', width: '12%', height: '35%', label: 'Person 94%' }],
  2: [{ top: '25%', left: '20%', width: '15%', height: '40%', label: 'Intruder 91%' }],
  3: [{ top: '40%', left: '60%', width: '20%', height: '30%', label: 'Vehicle 88%' }],
  5: [{ top: '35%', left: '30%', width: '10%', height: '28%', label: 'Person 95%' }],
  6: [{ top: '15%', left: '70%', width: '12%', height: '32%', label: 'Intruder 98%' }],
};
