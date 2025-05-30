import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

const InflationPanel: React.FC = () => {
  const { supplyData } = useDashboardData();
  const latestSupply = supplyData?.supplyHistory[0]?.supply || 0;

  return (
    <div>
      <h2>Inflation - BERA</h2>
      <p>Latest Supply: {latestSupply}</p>
    </div>
  );
};

export default InflationPanel; 