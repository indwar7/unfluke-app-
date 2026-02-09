import { Redirect } from 'expo-router';
import { useOnboarding } from '@/redux/contextHelper';

export default function IndexScreen() {
  const { onBoarding } = useOnboarding();

  // If onboarding is true (not completed), go to login
  // If onboarding is false (completed), go to dashboard
  return <Redirect href={onBoarding ? "/login" : "/dashboard"} />;
}