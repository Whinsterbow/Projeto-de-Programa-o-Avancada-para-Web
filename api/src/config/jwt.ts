
import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET não configurado ou muito curto no arquivo .env"
  );
}

const secret: string = JWT_SECRET;

export function gerarToken(usuarioId: number) {
  return jwt.sign(
    { usuarioId },
    secret,
    {
      algorithm: "HS256",
      expiresIn: "24h",
    }
  );
}

export function verificarToken(token: string) {
  const payload = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });

  if (
    typeof payload === "string" ||
    typeof payload.usuarioId !== "number" ||
    !Number.isInteger(payload.usuarioId) ||
    payload.usuarioId <= 0
  ) {
    throw new Error("Token inválido");
  }

  return payload;
}
