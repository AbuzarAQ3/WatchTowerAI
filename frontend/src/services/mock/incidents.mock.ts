import type { Incident } from '../../types/domain';

export const INITIAL_INCIDENTS: Incident[] = [
  { id: 'INC-017', type: 'Restricted Area Intrusion', camera: 'Main Gate', time: '2026-08-24 22:08', severity: 'high', status: 'open', confidence: '0.91' },
  { id: 'INC-016', type: 'Unattended Object', camera: 'Parking Lot B', time: '2026-08-24 21:06', severity: 'medium', status: 'reviewing', confidence: '0.76' },
  { id: 'INC-015', type: 'Perimeter Breach', camera: 'North Fence', time: '2026-08-24 19:50', severity: 'high', status: 'open', confidence: '0.88' },
  { id: 'INC-014', type: 'Crowd Gathering', camera: 'Canteen', time: '2026-08-24 18:33', severity: 'low', status: 'resolved', confidence: '0.64' },
  { id: 'INC-013', type: 'Vehicle — Wrong Zone', camera: 'East Parking', time: '2026-08-24 17:08', severity: 'medium', status: 'resolved', confidence: '0.82' },
  { id: 'INC-012', type: 'Restricted Area Intrusion', camera: 'Admin Block', time: '2026-08-24 14:22', severity: 'high', status: 'resolved', confidence: '0.95' },
  { id: 'INC-011', type: 'Loitering', camera: 'Library', time: '2026-08-24 12:47', severity: 'low', status: 'resolved', confidence: '0.69' },
  { id: 'INC-010', type: 'Vehicle — Wrong Zone', camera: 'Parking Lot A', time: '2026-08-24 11:15', severity: 'medium', status: 'reviewing', confidence: '0.84' },
  { id: 'INC-009', type: 'Tailgating at Entry', camera: 'Main Gate', time: '2026-08-24 09:32', severity: 'medium', status: 'open', confidence: '0.79' },
  { id: 'INC-008', type: 'Perimeter Breach', camera: 'North Fence', time: '2026-08-24 03:18', severity: 'high', status: 'resolved', confidence: '0.93' },
  { id: 'INC-007', type: 'Unattended Object', camera: 'Library', time: '2026-08-24 21:40', severity: 'medium', status: 'resolved', confidence: '0.72' },
  { id: 'INC-006', type: 'Crowd Gathering', camera: 'Main Gate', time: '2026-08-23 17:05', severity: 'low', status: 'resolved', confidence: '0.61' },
];

export const DASHBOARD_INCIDENTS: Incident[] = [
  { id: 'INC-017', type: 'Restricted Area Intrusion', camera: 'Main Gate', time: '14 mins ago', severity: 'high', status: 'open', confidence: '0.91' },
  { id: 'INC-016', type: 'Unattended Object', camera: 'Parking Lot B', time: '1h 02m ago', severity: 'medium', status: 'reviewing', confidence: '0.76' },
  { id: 'INC-015', type: 'Perimeter Breach', camera: 'North Fence', time: '2h 18m ago', severity: 'high', status: 'open', confidence: '0.88' },
  { id: 'INC-014', type: 'Crowd Gathering', camera: 'Canteen', time: '3h 45m ago', severity: 'low', status: 'resolved', confidence: '0.64' },
  { id: 'INC-013', type: 'Vehicle — Wrong Zone', camera: 'East Parking', time: '5h 10m ago', severity: 'medium', status: 'resolved', confidence: '0.82' },
];
