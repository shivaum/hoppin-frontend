import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen'

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      {/* <Stack.Screen name="ProfileStep" component={ProfileStep} />
      <Stack.Screen name="Done" component={Done} /> */}
    </Stack.Navigator>
  );
}