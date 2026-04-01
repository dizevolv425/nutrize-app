/**
 * Aplica máscara de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    // Fixo: (XX) XXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  // Celular: (XX) XXXXX-XXXX
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Aplica máscara de moeda brasileira: R$ X.XXX,XX
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  const number = parseInt(digits || "0", 10) / 100;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Converte string de moeda mascarada de volta para número
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
}
