
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import "../styles/crud.css";

interface ModalProps {
  titulo: string;
  aberto: boolean;
  onClose: () => void;
  children: ReactNode;
  bloqueado?: boolean;
}

export default function Modal({
  titulo,
  aberto,
  onClose,
  children,
  bloqueado = false,
}: ModalProps) {
  const tituloId = useId();

  const dialogRef =
    useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (aberto && !dialog.open) {
      dialog.showModal();
    }

    if (!aberto && dialog.open) {
      dialog.close();
    }
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      className="crud-modal"
      aria-labelledby={tituloId}
      onCancel={(event) => {
        event.preventDefault();

        if (!bloqueado) {
          onClose();
        }
      }}
    >
      <div className="modal-header">
        <h2 id={tituloId}>{titulo}</h2>

        <button
          type="button"
          className="modal-close"
          aria-label="Fechar janela"
          onClick={onClose}
          disabled={bloqueado}
        >
          ×
        </button>
      </div>

      <div className="modal-body">
        {children}
      </div>
    </dialog>
  );
}
