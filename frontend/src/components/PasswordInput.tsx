
import { useState } from "react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Informe sua senha",
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>

      <div className="password-container">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        <button
          type="button"
          className="password-toggle"
          aria-label={
            visivel ? "Ocultar senha" : "Mostrar senha"
          }
          onClick={() => setVisivel(!visivel)}
        >
          {visivel ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}
