import { EmissionDataPoint } from '../lib/inflation';

export interface BackupData {
  emissions: EmissionDataPoint[];
  lastUpdated: string;
  lastSynced: string;
  source: 'dune' | 'backup';
}

export interface BackupDataError {
  error: string;
  details?: string;
  timestamp: string;
}

export interface BackupDataResponse {
  data?: BackupData;
  error?: BackupDataError;
} 