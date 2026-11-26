
import Modal from "./Modal";

interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  carregando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  carregando = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      titulo={titulo}
      aberto={aberto}
      onClose={onCancel}
      bloqueado={carregando}
    >
      <div className="confirm-content">
        <div className="confirm-icon">!</div>

        <p>{mensagem}</p>

        <p className="confirm-warning">
          Esta ação não poderá ser desfeita.
        </p>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="button-secondary"
          onClick={onCancel}
          disabled={carregando}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="button-danger"
          onClick={onConfirm}
          disabled={carregando}
        >
          {carregando
            ? "Excluindo..."
            : "Confirmar exclusão"}
        </button>
      </div>
    </Modal>
  );
}
