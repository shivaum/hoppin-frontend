import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

const { width } = Dimensions.get("window");

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {/* Tabs */}
        <View style={styles.tabList}>
          <TouchableOpacity
            style={[styles.tabTrigger, activeTab === "login" && styles.tabTriggerActive]}
            onPress={() => setActiveTab("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabTrigger, activeTab === "signup" && styles.tabTriggerActive]}
            onPress={() => setActiveTab("signup")}
          >
            <Text style={[styles.tabText, activeTab === "signup" && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.tabContent}>
          {activeTab === "login" ? <LoginForm /> : <SignupForm />}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {activeTab === "login" ? (
            <Text style={styles.footerText}>
              Don’t have an account?{" "}
              <Text style={styles.footerLink} onPress={() => setActiveTab("signup")}>
                Sign up
              </Text>
            </Text>
          ) : (
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink} onPress={() => setActiveTab("login")}>
                Sign in
              </Text>
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  tabList: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  tabTriggerActive: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabContent: {
    marginBottom: 16,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    color: "#3b82f6",
    fontWeight: "500",
  },
});