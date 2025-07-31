import React from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { AuthProvider } from "./contexts/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Placeholder screens
import AuthForm from "./screens/AuthForm";
// import WelcomeScreen from "@/pages/WelcomeScreen";
// import SearchRides from "@/pages/SearchRides";
// import OfferRide from "@/pages/OfferRide";
// import MyRides from "@/pages/MyRides";
// import Messages from "@/pages/Messages";
// import UserProfile from "@/pages/UserProfile";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <Provider store={store}>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth">
              <Stack.Screen name="Auth" component={AuthForm} />
              {/* <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="SearchRides" component={SearchRides} />
              <Stack.Screen name="OfferRide" component={OfferRide} />
              <Stack.Screen name="MyRides" component={MyRides} />
              <Stack.Screen name="Messages" component={Messages} />
              <Stack.Screen name="UserProfile" component={UserProfile} /> */}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </Provider>
  );
}