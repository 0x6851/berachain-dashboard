import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { BackupData } from '../../../data/types';

const BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'backup.json');

export async function POST(request: NextRequest) {
  try {
    // Fetch latest data from Dune
    const duneResponse = await fetch('http://localhost:3000/api/dune');
    if (!duneResponse.ok) {
      throw new Error('Failed to fetch from Dune');
    }

    const duneData = await duneResponse.json();
    if (!duneData.emissions) {
      throw new Error('No emissions data in Dune response');
    }

    // Read current backup data
    const fileContent = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
    const backupData: BackupData = JSON.parse(fileContent);

    // Update backup data
    backupData.emissions = duneData.emissions;
    backupData.lastUpdated = new Date().toISOString();
    backupData.lastSynced = new Date().toISOString();
    backupData.source = 'dune';

    // Save updated backup
    await fs.writeFile(BACKUP_FILE_PATH, JSON.stringify(backupData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Backup data synced successfully',
      lastSynced: backupData.lastSynced
    });
  } catch (error) {
    console.error('Error syncing backup data:', error);
    return NextResponse.json({
      error: {
        error: 'Failed to sync backup data',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
} 