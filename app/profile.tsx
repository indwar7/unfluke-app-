import React from 'react';
import ProfileScreen from '../components/screens/ProfileScreen';
import { ScreenWithHeader } from '@/components/AppHeader';

const Profile = () => {
  return (
    <ScreenWithHeader>
      <ProfileScreen />
    </ScreenWithHeader>
  );
};

export default Profile;