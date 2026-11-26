
import {
  Request,
  Response,
  NextFunction,
} from "express";
import { verificarToken } from "../config/jwt";

export function autenticar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      mensagem: "Token de autenticação não informado",
    });
  }

  const partes = authorization.split(" ");

  if (
    partes.length !== 2 ||
    partes[0] !== "Bearer" ||
    !partes[1]
  ) {
    return res.status(401).json({
      mensagem: "Formato de token inválido",
    });
  }

  const token = partes[1];

  try {
    const payload = verificarToken(token);

    res.locals.usuarioId = payload.usuarioId;
  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado",
    });
  }

  return next();
}
