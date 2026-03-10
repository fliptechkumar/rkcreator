import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}
