import React from "react";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthForm from "./screens/AuthForm";
import Toast from "react-native-toast-message";
import TabNavigator from "./navigation/TabNavigator";
import type { RootStackParamList } from "./navigation/types";
import OnboardingStack from "./navigation/OnboardingStack";
import MainStack from './navigation/MainStack';
import Splash from "./screens/Splash";

// Lazy screen rendering logic
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();

  return (
    <NavigationContainer>
      {(authLoading) ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={Splash} />
        </Stack.Navigator>
      ) : !user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthForm} />
        </Stack.Navigator>
      ) : !user.is_onboarded ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainStack" component={MainStack} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </Provider>
  );
}