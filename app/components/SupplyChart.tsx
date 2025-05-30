import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

const SupplyChart: React.FC = () => {
  const { supplyData } = useDashboardData();
  const chartData = supplyData?.supplyHistory || [];

  return (
    <div>
      <h2>Supply Chart</h2>
      <ul>
        {chartData.map((item: { date: string; supply: number }, index: number) => (
          <li key={index}>
            Date: {item.date}, Supply: {item.supply}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplyChart; 