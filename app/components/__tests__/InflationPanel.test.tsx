import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InflationPanel from '../InflationPanel';
import { useDashboardData } from '../../hooks/useDashboardData';

// Mock the useDashboardData hook
jest.mock('../../hooks/useDashboardData');

describe('InflationPanel', () => {
  it('renders BERA inflation data correctly', () => {
    const mockSupplyData = {
      supplyHistory: [
        { date: '2025-05-29', supply: 119778656.84928428 },
        { date: '2025-05-30', supply: 119801281.56714788 },
      ],
    };

    (useDashboardData as jest.Mock).mockReturnValue({ supplyData: mockSupplyData });

    render(<InflationPanel />);
    expect(screen.getByText('Inflation - BERA')).toBeInTheDocument();
    expect(screen.getByText((content, node) =>
      node?.textContent === 'Latest Supply: 119778656.84928428')
    ).toBeInTheDocument();
  });

  it('handles missing supply data gracefully', () => {
    (useDashboardData as jest.Mock).mockReturnValue({ supplyData: null });

    render(<InflationPanel />);
    expect(screen.getByText('Inflation - BERA')).toBeInTheDocument();
    expect(screen.getByText((content, node) =>
      node?.textContent === 'Latest Supply: 0')
    ).toBeInTheDocument();
  });
}); 