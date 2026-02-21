import React from 'react';
import Pricing from '@/components/Pricing/Pricing';
import { ScreenWithHeader } from '@/components/AppHeader';
import { useNavigation } from '@react-navigation/native';

const PricingPage = () => {
  const navigation = useNavigation();
  return (
    <ScreenWithHeader>
      <Pricing navigation={navigation} />
    </ScreenWithHeader>
  );
};

export default PricingPage;