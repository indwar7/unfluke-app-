import React from 'react';
import LeadsDashboard from '@/components/LeadsDashboard';
import { ScreenWithHeader } from '@/components/AppHeader';

const Leads = () => {
  return (
    <ScreenWithHeader>
      <LeadsDashboard />
    </ScreenWithHeader>
  );
};

export default Leads;