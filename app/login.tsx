import React, { useState } from "react";
import { Image } from "expo-image";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "@/constants/firebaseConfig";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// Conditionally load and configure GoogleSignin on native platforms
let GoogleSignin: any = null;
if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "453121573030-placeholder.apps.googleusercontent.com",
    });
  } catch (error) {
    console.warn("Google Sign-In is not available on this device configuration.", error);
  }
}

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";

  // Mode state: 'login' or 'signup'
  const [isSignUp, setIsSignUp] = useState(false);

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    light: {
      cardBg: "#FFFFFF",
      inputBg: "#F3F4F6",
      inputText: "#1F2937",
      placeholder: "#9CA3AF",
      border: "#E5E7EB",
      primary: "#4CAF50",
      textMuted: "#6B7280",
    },
    dark: {
      cardBg: "#1F2937",
      inputBg: "#374151",
      inputText: "#F9FAFB",
      placeholder: "#9CA3AF",
      border: "#4B5563",
      primary: "#66BB6A",
      textMuted: "#9CA3AF",
    },
  }[colorScheme];

  const validateEmail = (emailStr: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(emailStr);
  };

  const handleAuth = async () => {
    setError(null);

    // Validation checks
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Register standard Firebase Auth account (automatically hashes credentials)
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        // Sign in standard Firebase Auth account
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // Routing is automatically handled by the RootLayout AuthProtected observer
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let friendlyMessage = "An error occurred. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already registered.";
      } else if (err.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email or password.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password should be stronger.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Invalid email format.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      if (Platform.OS === "web") {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
      } else {
        if (!GoogleSignin) {
          throw new Error(
            "Google Sign-In is not configured. Google Sign-In requires a custom Development Build on mobile devices. Please use Email/Password Sign In."
          );
        }
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const signInResult = await GoogleSignin.signIn();
        const idToken = signInResult?.data?.idToken || signInResult?.idToken;
        if (!idToken) {
          throw new Error("No Google ID token was returned.");
        }
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // Suppress normal user cancellation or in-progress operations
      if (
        err.code !== "ASYNC_OP_IN_PROGRESS" &&
        err.code !== "12501" &&
        err.code !== "7" &&
        err.message !== "Sign in cancelled"
      ) {
        let message = err.message || "Google sign-in failed.";
        if (err.code === "DEVELOPER_ERROR") {
          message =
            "Developer Configuration Error: Check your Google Client ID, SHA-1 fingerprint, and Firebase settings.";
        }
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
            />
            <ThemedText type="title" style={styles.title}>
              FoodApp
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
              Track your nutrition journey with ease
            </ThemedText>
          </ThemedView>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, !isSignUp && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
              >
                <ThemedText style={[styles.tabText, !isSignUp && { fontWeight: "700", color: colors.primary }]}>
                  Sign In
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, isSignUp && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
              >
                <ThemedText style={[styles.tabText, isSignUp && { fontWeight: "700", color: colors.primary }]}>
                  Sign Up
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF5252" />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            {/* Email Input */}
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="mail-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                placeholder="Email Address"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input (Sign Up Only) */}
            {isSignUp && (
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.submitButtonText}>
                  {isSignUp ? "Create Account" : "Sign In"}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.dividerText, { color: colors.textMuted }]}>OR</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social Sign-In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
            disabled={loading}
          >
            <View style={styles.googleButtonContent}>
              <Ionicons
                name="logo-google"
                size={20}
                color="#FFFFFF"
                style={styles.googleIcon}
              />
              <ThemedText type="defaultSemiBold" style={styles.googleButtonText}>
                Sign in with Google
              </ThemedText>
            </View>
          </TouchableOpacity>

          <ThemedText style={[styles.disclaimer, { color: colors.textMuted }]}>
            Secure authentication powered by Firebase.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  googleButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    marginBottom: 20,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});