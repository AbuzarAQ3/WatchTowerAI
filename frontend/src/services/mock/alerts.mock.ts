import type { Alert } from '../../types/domain';

export const INITIAL_ALERTS: Alert[] = [
  { id: 'ALT-005', title: 'Restricted Area Intrusion', desc: 'Person detected in Admin Block restricted zone. Immediate action required.', camera: 'Admin Block', time: '14 mins ago', level: 'high', acknowledged: false },
  { id: 'ALT-004', title: 'Loitering Detected', desc: 'Individual stationary near Main Gate entry for over 15 minutes.', camera: 'Main Gate', time: '42 mins ago', level: 'medium', acknowledged: false },
  { id: 'ALT-003', title: 'Unattended Object — Parking', desc: 'Stationary object detected in Parking Lot B for >10 minutes.', camera: 'Parking Lot B', time: '1h 02m ago', level: 'medium', acknowledged: false },
  { id: 'ALT-002', title: 'Perimeter Breach Detected', desc: 'Motion detected along North Fence boundary at 19:50.', camera: 'North Fence', time: '2h 18m ago', level: 'high', acknowledged: false },
  { id: 'ALT-001', title: 'Camera Offline — Canteen', desc: 'Camera feed lost. Possible power or network issue.', camera: 'Canteen', time: '3h ago', level: 'low', acknowledged: true },
  { id: 'ALT-000', title: 'Vehicle in Pedestrian Zone', desc: 'Two-wheeler detected on the walkway outside East Parking.', camera: 'East Parking', time: '4h 30m ago', level: 'low', acknowledged: true },
];
