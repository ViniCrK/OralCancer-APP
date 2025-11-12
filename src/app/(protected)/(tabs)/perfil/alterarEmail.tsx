import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useUsuarioService } from "@/services/usuario";
import { Formik } from "formik";
import { useEspecialistaService } from "@/services/especialista";
import { useEspecialistaStore } from "@/store/especialista";
import { AlterarEmailDados } from "@/types/especialista";
import { AlterarEmailSchema } from "@/schemas/PerfilSchema";
import { Ionicons } from "@expo/vector-icons";

type InputProps = {
  label: string;
  children: React.ReactNode;
  errorMessage?: string;
  isTouched?: boolean;
};
const FormInput = ({
  label,
  children,
  errorMessage,
  isTouched,
}: InputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[
        styles.inputBase,
        isTouched && errorMessage ? styles.inputError : null,
      ]}
    >
      {children}
    </View>
    {isTouched && errorMessage && (
      <Text style={styles.errorText}>{errorMessage}</Text>
    )}
  </View>
);

export default function AlterarEmail() {
  const router = useRouter();
  const usuarioService = useUsuarioService();
  const { especialista } = useEspecialistaStore();
  const especialistaService = useEspecialistaService();

  const handleAlterarEmail = async (
    dados: AlterarEmailDados,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    Alert.alert(
      "Alterar E-mail",
      "Você tem certeza de que deseja alterar o seu e-mail?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setSubmitting(false),
        },
        {
          text: "Sim",
          style: "default",
          onPress: async () => {
            try {
              const { sucesso, mensagem } = await usuarioService.alterarEmail(
                dados.novoEmail
              );

              if (!sucesso) throw new Error(mensagem);

              if (!especialista?.id)
                throw new Error("ID do especialista não encontrado.");

              await especialistaService.atualizar(especialista.id, {
                email: dados.novoEmail,
              });

              Alert.alert(
                "Confirmação Necessária",
                `Enviamos um link de confirmação para o seu NOVO e-mail (${dados.novoEmail}).`
              );
              router.replace("/(tabs)/perfil");
            } catch (error) {
              console.error("Erro ao alterar e-mail:", error);
              Alert.alert(
                "Erro",
                "Não foi possível alterar o e-mail ou o e-mail já está sendo utilizado."
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar E-mail</Text>
        <View style={{ width: 40 }} />
      </View>

      <Formik
        initialValues={{ novoEmail: "", confirmarEmail: "" }}
        validationSchema={AlterarEmailSchema}
        onSubmit={handleAlterarEmail}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <View>
            <FormInput
              label="Novo Endereço de E-mail"
              isTouched={touched.novoEmail}
              errorMessage={errors.novoEmail as string}
            >
              <TextInput
                style={styles.inputText}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange("novoEmail")}
                onBlur={handleBlur("novoEmail")}
                value={values.novoEmail}
                autoFocus={true}
              />
            </FormInput>

            <FormInput
              label="Confirmar Novo E-mail"
              isTouched={touched.confirmarEmail}
              errorMessage={errors.confirmarEmail as string}
            >
              <TextInput
                style={styles.inputText}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange("confirmarEmail")}
                onBlur={handleBlur("confirmarEmail")}
                value={values.confirmarEmail}
              />
            </FormInput>

            <TouchableOpacity
              style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoTexto}>Enviar Confirmação</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Fundo cinza bem claro
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 0, // Ajuste para Android
    paddingBottom: 40,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40, // Espaço para status bar
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  inputContainer: {
    marginBottom: 20, // Espaçamento entre os campos
  },
  label: {
    fontSize: 16,
    color: "#334155", // Label mais escuro
    marginBottom: 8,
    fontWeight: "600",
  },
  inputBase: {
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 15,
    justifyContent: "center",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0", // Borda sutil
  },
  inputText: {
    fontSize: 16,
    color: "#1e293b",
    padding: 0, // Remove padding nativo
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
  },
  botao: {
    backgroundColor: "#008C9E", // Cor teal
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoDesabilitado: {
    backgroundColor: "#a5f3fc",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
