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

// Lazy screen rendering logic
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Main" : "Auth"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth" component={AuthForm} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
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