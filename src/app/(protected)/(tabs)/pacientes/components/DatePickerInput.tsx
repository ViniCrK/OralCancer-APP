import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type DatePickerProps = {
  label: string;
  value: Date;
  onChange: (selectedDate: Date) => void;
  errorMessage?: string;
};

export default function DatePickerInput({
  label,
  value,
  onChange,
  errorMessage,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const currentDate = value ? new Date(value) : new Date();

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowPicker(Platform.OS === "ios");

    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  const formattedDate = value
    ? value.toLocaleDateString("pt-BR")
    : "dd/mm/aaaa";

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[
          styles.input, // Reutilize o estilo do input normal
          errorMessage ? styles.inputError : null,
          styles.dateInput, // Estilo específico para o date input
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dateInputText,
            value ? { color: "#000" } : { color: "#9ca3af" },
          ]}
        >
          {formattedDate}
        </Text>
        <Ionicons name="calendar-outline" size={24} color="#64748b" />{" "}
        {/* Ícone de calendário */}
      </TouchableOpacity>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20, // Espaçamento entre os campos
  },
  label: {
    fontSize: 16,
    color: "#334155", // Mais escuro
    marginBottom: 8, // Mais espaço entre label e input
    fontWeight: "600", // Mais negrito
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10, // Bordas arredondadas
    paddingVertical: Platform.OS === "ios" ? 14 : 10, // Ajuste para iOS vs Android
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2, // Sombra suave
    borderWidth: 1, // Borda sutil
    borderColor: "#e2e8f0", // Cor da borda
  },
  inputError: {
    borderColor: "#EF4444", // Vermelho para erro
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputText: {
    fontSize: 16,
    // A cor será definida dinamicamente
  },
});
