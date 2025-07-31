import React, { ReactNode, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (!loading && !user) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Auth" as never, // your auth/login screen
            params: { from: route.name } as never,
          },
        ],
      });
    }
  }, [loading, user, navigation, route.name]);

  if (loading || !user) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});