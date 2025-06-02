import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { BackupData, BackupDataResponse } from '../../../data/types';

const BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'backup.json');

export async function GET() {
  try {
    // Read the backup data file
    const fileContent = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
    const backupData: BackupData = JSON.parse(fileContent);

    // If the backup is empty, try to fetch from Dune first
    if (backupData.emissions.length === 0) {
      try {
        const duneResponse = await fetch('http://localhost:3000/api/dune');
        if (duneResponse.ok) {
          const duneData = await duneResponse.json();
          // Update backup with Dune data
          backupData.emissions = duneData.emissions || [];
          backupData.lastUpdated = new Date().toISOString();
          backupData.lastSynced = new Date().toISOString();
          backupData.source = 'dune';
          // Save updated backup
          await fs.writeFile(BACKUP_FILE_PATH, JSON.stringify(backupData, null, 2));
        }
      } catch (error) {
        console.error('Error fetching from Dune:', error);
      }
    }

    return NextResponse.json({ data: backupData });
  } catch (error) {
    console.error('Error reading backup data:', error);
    return NextResponse.json({
      error: {
        error: 'Failed to read backup data',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const backupData: BackupData = {
      emissions: data.emissions || [],
      lastUpdated: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      source: data.source || 'backup'
    };

    // Save the backup data
    await fs.writeFile(BACKUP_FILE_PATH, JSON.stringify(backupData, null, 2));

    return NextResponse.json({ data: backupData });
  } catch (error) {
    console.error('Error saving backup data:', error);
    return NextResponse.json({
      error: {
        error: 'Failed to save backup data',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
} 