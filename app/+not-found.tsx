import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        {/* <Image
          source={require('../assets/404.png')} // Ensure you have a 404 image here
          style={styles.image}
          resizeMode="contain"
        /> */}
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>The page you’re looking for doesn’t exist or has been moved.</Text>
        <Link href="/dashboard" style={styles.link}>
          <Text style={styles.linkText}>← Go to Home Screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // image: {
  //   width: 250,
  //   height: 200,
  //   marginBottom: 20,
  // },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  link: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
