import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WeightUnitProvider } from './src/context/WeightUnitContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <WeightUnitProvider>
        <StatusBar style="light" />
        <HomeScreen />
      </WeightUnitProvider>
    </SafeAreaProvider>
  );
}
