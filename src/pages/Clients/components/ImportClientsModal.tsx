import React, { useState, useRef } from "react";
import { FaTimes, FaFileUpload, FaDownload, FaSpinner } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { createClient } from "../../../services/clientService";
import "./ImportClientsModal.css";

interface ImportClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nutritionistId: string;
}

interface ParsedRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender?: "masculino" | "feminino" | "outro";
  weight?: number;
  height?: number;
}

interface ImportResult {
  row: number;
  name: string;
  status: "success" | "error";
  message?: string;
}

const CSV_HEADER = "nome,sobrenome,email,telefone,nascimento,genero,peso,altura";
const CSV_EXAMPLE = "Maria,Silva,maria@email.com,(11) 99999-0000,1990-05-20,feminino,65,168";

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n").filter((l) => l.trim());
  const start = lines[0].toLowerCase().includes("nome") ? 1 : 0;
  return lines.slice(start).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const genderRaw = (cols[5] || "").toLowerCase();
    const gender =
      genderRaw === "masculino" || genderRaw === "m"
        ? "masculino"
        : genderRaw === "feminino" || genderRaw === "f"
        ? "feminino"
        : genderRaw === "outro"
        ? "outro"
        : undefined;
    return {
      firstName: cols[0] || "",
      lastName: cols[1] || "",
      email: cols[2] || "",
      phone: cols[3] || "",
      birthDate: cols[4] || "",
      gender,
      weight: cols[6] ? parseFloat(cols[6]) : undefined,
      height: cols[7] ? parseFloat(cols[7]) : undefined,
    };
  });
}

function validateRow(row: ParsedRow): string | null {
  if (!row.firstName.trim()) return "Nome obrigatório";
  if (!row.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return "E-mail inválido";
  if (!row.phone.trim() || row.phone.replace(/\D/g, "").length < 10) return "Telefone inválido";
  return null;
}

export const ImportClientsModal: React.FC<ImportClientsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  nutritionistId,
}) => {
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setPreview(parseCSV(text));
      setStep("preview");
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    setLoading(true);
    const importResults: ImportResult[] = [];
    for (let i = 0; i < preview.length; i++) {
      const row = preview[i];
      const validationError = validateRow(row);
      if (validationError) {
        importResults.push({ row: i + 1, name: `${row.firstName} ${row.lastName}`, status: "error", message: validationError });
        continue;
      }
      try {
        await createClient(
          { firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone, birthDate: row.birthDate, gender: row.gender, weight: row.weight, height: row.height },
          nutritionistId
        );
        importResults.push({ row: i + 1, name: `${row.firstName} ${row.lastName}`, status: "success" });
      } catch (err: any) {
        importResults.push({ row: i + 1, name: `${row.firstName} ${row.lastName}`, status: "error", message: err?.message || "Erro desconhecido" });
      }
    }
    setResults(importResults);
    setLoading(false);
    setStep("done");
    if (importResults.some((r) => r.status === "success")) onSuccess();
  };

  const handleDownloadTemplate = () => {
    const content = `${CSV_HEADER}\n${CSV_EXAMPLE}`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-importacao-pacientes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (loading) return;
    setPreview([]);
    setResults([]);
    setStep("upload");
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  if (!isOpen) return null;

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="import-modal-overlay" onClick={handleClose}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal__header">
          <h2 className="import-modal__title">Importar Pacientes em Lote</h2>
          <button className="import-modal__close" onClick={handleClose} disabled={loading}><FaTimes /></button>
        </div>

        {step === "upload" && (
          <div className="import-modal__body">
            <p className="import-modal__description">
              Faça upload de um arquivo CSV com os dados dos pacientes. Use o modelo abaixo como referência.
            </p>
            <div className="import-modal__columns">
              <strong>Colunas esperadas:</strong>
              <code>{CSV_HEADER}</code>
            </div>
            <div className="import-modal__actions-row">
              <Button variant="secondary" onClick={handleDownloadTemplate}>
                <FaDownload /> Baixar modelo CSV
              </Button>
              <label className="import-modal__file-label">
                <FaFileUpload /> Selecionar arquivo CSV
                <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="import-modal__body">
            <p className="import-modal__description">{preview.length} paciente(s) encontrado(s). Confira os dados antes de importar.</p>
            <div className="import-modal__table-wrapper">
              <table className="import-modal__table">
                <thead>
                  <tr><th>#</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Nascimento</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => {
                    const err = validateRow(row);
                    return (
                      <tr key={i} className={err ? "import-modal__row--error" : ""}>
                        <td>{i + 1}</td>
                        <td>{row.firstName} {row.lastName}</td>
                        <td>{row.email}</td>
                        <td>{row.phone}</td>
                        <td>{row.birthDate}</td>
                        <td>{err ? <span className="import-modal__badge import-modal__badge--error">{err}</span> : <span className="import-modal__badge import-modal__badge--ok">OK</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="import-modal__footer">
              <Button variant="secondary" onClick={() => setStep("upload")} disabled={loading}>Voltar</Button>
              <Button variant="primary" onClick={handleImport} disabled={loading || preview.every((r) => validateRow(r) !== null)}>
                {loading ? <><FaSpinner className="import-modal__spinner" /> Importando...</> : `Importar ${preview.filter((r) => !validateRow(r)).length} paciente(s)`}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="import-modal__body">
            <div className="import-modal__summary">
              <span className="import-modal__summary-success">✓ {successCount} importado(s) com sucesso</span>
              {errorCount > 0 && <span className="import-modal__summary-error">✗ {errorCount} com erro</span>}
            </div>
            <div className="import-modal__table-wrapper">
              <table className="import-modal__table">
                <thead><tr><th>#</th><th>Nome</th><th>Status</th><th>Detalhe</th></tr></thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.row} className={r.status === "error" ? "import-modal__row--error" : ""}>
                      <td>{r.row}</td><td>{r.name}</td>
                      <td><span className={`import-modal__badge import-modal__badge--${r.status === "success" ? "ok" : "error"}`}>{r.status === "success" ? "Importado" : "Erro"}</span></td>
                      <td>{r.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="import-modal__footer">
              <Button variant="primary" onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
