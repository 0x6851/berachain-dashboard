import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplyChart from '../SupplyChart';
import { useDashboardData } from '../../hooks/useDashboardData';

// Mock the useDashboardData hook
jest.mock('../../hooks/useDashboardData');

describe('SupplyChart', () => {
  it('renders the supply chart with BERA data', () => {
    const mockSupplyData = {
      supplyHistory: [
        { date: '2025-05-29', supply: 119778656.84928428 },
        { date: '2025-05-30', supply: 119801281.56714788 },
      ],
    };

    (useDashboardData as jest.Mock).mockReturnValue({ supplyData: mockSupplyData });

    render(<SupplyChart />);
    expect(screen.getByText('Supply Chart')).toBeInTheDocument();
    expect(screen.getByText('Date: 2025-05-29, Supply: 119778656.84928428')).toBeInTheDocument();
    expect(screen.getByText('Date: 2025-05-30, Supply: 119801281.56714788')).toBeInTheDocument();
  });

  it('handles empty supply data gracefully', () => {
    (useDashboardData as jest.Mock).mockReturnValue({ supplyData: { supplyHistory: [] } });

    render(<SupplyChart />);
    expect(screen.getByText('Supply Chart')).toBeInTheDocument();
    expect(screen.queryByText(/Date:/)).not.toBeInTheDocument();
  });

  it('handles null supply data gracefully', () => {
    (useDashboardData as jest.Mock).mockReturnValue({ supplyData: null });

    render(<SupplyChart />);
    expect(screen.getByText('Supply Chart')).toBeInTheDocument();
    expect(screen.queryByText(/Date:/)).not.toBeInTheDocument();
  });
}); 