import { Redirect, Stack } from 'expo-router';

export default function IndexScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
      <Redirect href="/dashboard" />
    </>
  );
}