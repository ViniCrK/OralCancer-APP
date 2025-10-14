export default function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0;

  const hoje = new Date();

  const [ano, mes, dia] = dataNascimento.split("-").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesDiff = hoje.getMonth() - nascimento.getMonth();
  const diaDiff = hoje.getDate() - nascimento.getDate();

  if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
    idade--;
  }
  return idade;
}
