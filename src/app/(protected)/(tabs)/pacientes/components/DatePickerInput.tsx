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

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.formControl, errorMessage ? styles.errorBorder : null]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.textValue}>
          {value
            ? currentDate.toLocaleDateString("pt-BR")
            : "Selecione uma data"}
        </Text>
      </TouchableOpacity>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: { marginBottom: 16 },
  label: { marginBottom: 8, fontSize: 16, color: "#333", fontWeight: "500" },
  formControl: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  textValue: { fontSize: 16, color: "#333" },
  errorBorder: { borderColor: "#ef4444", borderWidth: 2 },
  errorText: { color: "red", fontSize: 12, marginTop: 4 },
});
