
interface PaginaProvisoriaProps {
  titulo: string;
  descricao: string;
}

export default function PaginaProvisoria({
  titulo,
  descricao,
}: PaginaProvisoriaProps) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
      </div>

      <section className="content-card empty-state">
        <div className="placeholder-icon">
          🚧
        </div>

        <h2>Página em desenvolvimento</h2>

        <p>
          Esta funcionalidade será implementada
          nas próximas etapas.
        </p>
      </section>
    </div>
  );
}
