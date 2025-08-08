import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Button } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAuth } from "../../contexts/AuthContext";

export default function WelcomeScreen() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const { markOnboarded } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

const features = [
  {
    title: "Share Rides",
    description: "Offer rides to fellow Cal Poly students and split costs",
    icon: <Ionicons name="car-outline" size={24} color="black" />
  },
  {
    title: "Find Rides",
    description: "Search for rides to campus, airport, or anywhere in SLO",
    icon: <Ionicons name="search-outline" size={24} color="black" />
  },
  {
    title: "Student Community",
    description: "Connect with verified Cal Poly students only",
    icon: <Ionicons name="people-outline" size={24} color="black" />
  },
  {
    title: "Safe & Trusted",
    description: "Ratings and reviews keep our community safe",
    icon: <Ionicons name="shield-checkmark-outline" size={24} color="black" />
  }
];



const onPressGetStarted = async () => {
  await markOnboarded();
  const rootNav = nav.getParent()?.getParent(); // child -> Onboarding -> Root
  rootNav?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' as never }],
    })
  );
};

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Text style={styles.title}>
          Welcome to <Text style={styles.highlight}>Hopin SLO</Text>
        </Text>
        <Text style={styles.subtitle}>
          The rideshare app built for Cal Poly students
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                currentFeature === index && styles.activeCard
              ]}
              onPress={() => setCurrentFeature(index)}
            >
              <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.ctaContainer}>
        <Button onPress={onPressGetStarted} title="Get Started" color="#007bff" />
        <Text style={styles.ctaSubtitle}>
          Join the Cal Poly rideshare community today
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center"
  },
  highlight: {
    color: "#007bff"
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 10
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2
  },
  activeCard: {
    borderColor: "#007bff",
    borderWidth: 2
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconContainer: {
    marginRight: 10
  },
  icon: {
    fontSize: 24,
    color: "#007bff"
  },
  textContainer: {
    flex: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333"
  },
  featureDescription: {
    fontSize: 14,
    color: "#666"
  },
  ctaContainer: {
    alignItems: "center",
    marginTop: 20
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5
  },
  ctaIcon: {
    fontSize: 20,
    color: "#fff",
    marginRight: 5
  },
  ctaText: {
    fontSize: 16,
    color: "#fff"
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 10
  }
});