import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps extends TextInputProps {
  label: string;
  errorMessage?: string;
}

export default function PasswordInput({
  label,
  errorMessage,
  style,
  ...props
}: PasswordInputProps) {
  const [isSecure, setIsSecure] = useState(true);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[styles.inputWrapper, errorMessage ? styles.inputError : null]}
      >
        <TextInput
          style={styles.input}
          {...props}
          secureTextEntry={isSecure}
          placeholderTextColor={"#9ca3af"}
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={() => setIsSecure((prev) => !prev)}
          style={styles.iconButton}
        >
          <Ionicons
            name={isSecure ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  iconButton: {
    padding: 10,
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
});
