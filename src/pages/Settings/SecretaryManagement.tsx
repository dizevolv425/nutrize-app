import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import {
  createSecretary,
  deleteSecretary,
  getSecretaries,
  updateSecretaryPermissions,
  MODULE_LABELS,
  type Secretary,
} from "../../services/secretaryService";
import type { SecretaryModule } from "../../types/user";
import "./SecretaryManagement.css";

const ALL_MODULES: SecretaryModule[] = ["clients", "agenda", "financial"];

interface CreateForm {
  name: string;
  email: string;
  permissions: SecretaryModule[];
}

const emptyForm = (): CreateForm => ({
  name: "",
  email: "",
  permissions: [],
});

export const SecretaryManagement: React.FC = () => {
  const { user } = useAuth();
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm());
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estado para edição inline de permissões
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<
    SecretaryModule[]
  >([]);
  const [saving, setSaving] = useState(false);

  // Confirmação de exclusão
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    loadSecretaries();
  }, [user?.uid]);

  const loadSecretaries = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const list = await getSecretaries(user.uid);
      setSecretaries(list);
    } catch (err) {
      console.error("Erro ao carregar secretárias:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Criar ----------

  const handleCreate = async () => {
    setFormError(null);
    if (!form.name.trim()) return setFormError("Nome é obrigatório.");
    if (!form.email.trim()) return setFormError("E-mail é obrigatório.");
    if (form.permissions.length === 0)
      return setFormError("Selecione pelo menos um módulo de acesso.");
    if (!user?.uid) return;

    setCreating(true);
    try {
      const created = await createSecretary(user.uid, form);
      setSecretaries((prev) => [...prev, created]);
      setShowModal(false);
      setForm(emptyForm());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar secretária.";
      setFormError(message);
    } finally {
      setCreating(false);
    }
  };

  const toggleFormPermission = (mod: SecretaryModule) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(mod)
        ? prev.permissions.filter((p) => p !== mod)
        : [...prev.permissions, mod],
    }));
  };

  // ---------- Editar permissões ----------

  const startEditing = (secretary: Secretary) => {
    setEditingUid(secretary.uid);
    setEditingPermissions([...secretary.permissions]);
  };

  const cancelEditing = () => {
    setEditingUid(null);
    setEditingPermissions([]);
  };

  const toggleEditPermission = (mod: SecretaryModule) => {
    setEditingPermissions((prev) =>
      prev.includes(mod) ? prev.filter((p) => p !== mod) : [...prev, mod]
    );
  };

  const savePermissions = async (uid: string) => {
    setSaving(true);
    try {
      await updateSecretaryPermissions(uid, editingPermissions);
      setSecretaries((prev) =>
        prev.map((s) =>
          s.uid === uid ? { ...s, permissions: editingPermissions } : s
        )
      );
      setEditingUid(null);
    } catch (err) {
      console.error("Erro ao salvar permissões:", err);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Excluir ----------

  const confirmDelete = async (uid: string) => {
    try {
      await deleteSecretary(uid);
      setSecretaries((prev) => prev.filter((s) => s.uid !== uid));
    } catch (err) {
      console.error("Erro ao excluir secretária:", err);
    } finally {
      setDeletingUid(null);
    }
  };

  // ---------- Render ----------

  return (
    <div className="secretary-mgmt">
      <div className="secretary-mgmt__header">
        <div className="secretary-mgmt__title-row">
          <FaUserTie size={24} className="secretary-mgmt__icon" />
          <h1 className="secretary-mgmt__title">Gerenciar Secretária</h1>
        </div>
        <p className="secretary-mgmt__subtitle">
          Crie contas de secretária e defina quais módulos cada uma pode
          acessar.
        </p>
        <button
          className="secretary-mgmt__btn-add"
          onClick={() => {
            setForm(emptyForm());
            setFormError(null);
            setShowModal(true);
          }}
        >
          <FaPlus size={14} /> Adicionar secretária
        </button>
      </div>

      {loading ? (
        <div className="secretary-mgmt__loading">Carregando...</div>
      ) : secretaries.length === 0 ? (
        <div className="secretary-mgmt__empty">
          <FaUserTie size={48} className="secretary-mgmt__empty-icon" />
          <p>Nenhuma secretária cadastrada ainda.</p>
          <p>Clique em "Adicionar secretária" para começar.</p>
        </div>
      ) : (
        <div className="secretary-mgmt__list">
          {secretaries.map((s) => (
            <div key={s.uid} className="secretary-card">
              <div className="secretary-card__info">
                <div className="secretary-card__name">
                  <FaUserTie size={16} />
                  <span>{s.name}</span>
                </div>
                <div className="secretary-card__email">{s.email}</div>
              </div>

              <div className="secretary-card__permissions">
                {editingUid === s.uid ? (
                  <div className="secretary-card__edit-perms">
                    {ALL_MODULES.map((mod) => (
                      <label
                        key={mod}
                        className="secretary-card__perm-toggle"
                      >
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes(mod)}
                          onChange={() => toggleEditPermission(mod)}
                        />
                        <span>{MODULE_LABELS[mod]}</span>
                      </label>
                    ))}
                    <div className="secretary-card__edit-actions">
                      <button
                        className="secretary-card__btn secretary-card__btn--save"
                        onClick={() => savePermissions(s.uid)}
                        disabled={saving}
                      >
                        <FaCheck size={12} />
                        {saving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        className="secretary-card__btn secretary-card__btn--cancel"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        <FaTimes size={12} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="secretary-card__perm-badges">
                    {s.permissions.map((mod) => (
                      <span key={mod} className="secretary-card__badge">
                        {MODULE_LABELS[mod]}
                      </span>
                    ))}
                    {s.permissions.length === 0 && (
                      <span className="secretary-card__badge secretary-card__badge--empty">
                        Sem permissões
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="secretary-card__actions">
                {editingUid !== s.uid && (
                  <button
                    className="secretary-card__btn secretary-card__btn--edit"
                    onClick={() => startEditing(s)}
                    title="Editar permissões"
                  >
                    <FaEdit size={14} />
                  </button>
                )}
                <button
                  className="secretary-card__btn secretary-card__btn--delete"
                  onClick={() => setDeletingUid(s.uid)}
                  title="Excluir secretária"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação */}
      {showModal && (
        <div
          className="secretary-mgmt__overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="secretary-mgmt__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="secretary-mgmt__modal-header">
              <h2>Nova Secretária</h2>
              <button
                className="secretary-mgmt__modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="secretary-mgmt__modal-body">
              {formError && (
                <div className="secretary-mgmt__form-error">{formError}</div>
              )}

              <div className="secretary-mgmt__field">
                <label>Nome completo</label>
                <input
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="secretary-mgmt__field">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="secretary-mgmt__field">
                <p className="secretary-mgmt__info">
                  A secretária receberá um e-mail com um link para{" "}
                  <strong>definir a própria senha de acesso</strong>.
                </p>
              </div>

              <div className="secretary-mgmt__field">
                <label>Módulos de acesso</label>
                <div className="secretary-mgmt__modules">
                  {ALL_MODULES.map((mod) => (
                    <label key={mod} className="secretary-mgmt__module-option">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(mod)}
                        onChange={() => toggleFormPermission(mod)}
                      />
                      <span>{MODULE_LABELS[mod]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="secretary-mgmt__modal-footer">
              <button
                className="secretary-mgmt__btn-cancel"
                onClick={() => setShowModal(false)}
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                className="secretary-mgmt__btn-confirm"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? "Criando..." : "Criar secretária"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deletingUid && (
        <div
          className="secretary-mgmt__overlay"
          onClick={() => setDeletingUid(null)}
        >
          <div
            className="secretary-mgmt__modal secretary-mgmt__modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="secretary-mgmt__modal-header">
              <h2>Confirmar exclusão</h2>
            </div>
            <div className="secretary-mgmt__modal-body">
              <p>
                Tem certeza que deseja excluir esta secretária? O acesso dela
                ao sistema será revogado imediatamente.
              </p>
            </div>
            <div className="secretary-mgmt__modal-footer">
              <button
                className="secretary-mgmt__btn-cancel"
                onClick={() => setDeletingUid(null)}
              >
                Cancelar
              </button>
              <button
                className="secretary-mgmt__btn-delete"
                onClick={() => confirmDelete(deletingUid)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
