import React from 'react';
import Trading from '@/components/HistoricalTrading';
import { ScreenWithHeader } from '@/components/AppHeader';

const Historical = () => {
  return (
    <ScreenWithHeader>
      <Trading />
    </ScreenWithHeader>
  );
};

export default Historical;