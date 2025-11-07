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
} from "react-native";
import { useUsuarioService } from "@/services/usuario";
import { Formik } from "formik";
import { useEspecialistaService } from "@/services/especialista";
import { useEspecialistaStore } from "@/store/especialista";
import { AlterarEmailDados } from "@/types/especialista";
import { AlterarEmailSchema } from "@/schemas/PerfilSchema";

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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Alterar E-mail</Text>
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
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Novo Endereço de E-mail</Text>

                <TextInput
                  style={[
                    styles.input,
                    touched.novoEmail && errors.novoEmail
                      ? styles.inputError
                      : null,
                  ]}
                  placeholder="seunovoemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={handleChange("novoEmail")}
                  onBlur={handleBlur("novoEmail")}
                  value={values.novoEmail}
                  autoFocus={true}
                />

                {touched.novoEmail && errors.novoEmail && (
                  <Text style={styles.errorText}>{errors.novoEmail}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Novo E-mail</Text>

                <TextInput
                  style={[
                    styles.input,
                    touched.confirmarEmail && errors.confirmarEmail
                      ? styles.inputError
                      : null,
                  ]}
                  placeholder="Repita o novo e-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={handleChange("confirmarEmail")}
                  onBlur={handleBlur("confirmarEmail")}
                  value={values.confirmarEmail}
                />

                {touched.confirmarEmail && errors.confirmarEmail && (
                  <Text style={styles.errorText}>{errors.confirmarEmail}</Text>
                )}
              </View>

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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingTop: 20,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: { backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  inputContainer: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  label: { fontSize: 16, color: "#333", marginBottom: 5, fontWeight: "500" },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#008C9E",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  botaoDesabilitado: { backgroundColor: "#a0d8c5" },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
