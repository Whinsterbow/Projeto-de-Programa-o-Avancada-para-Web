
interface StatCardProps {
  titulo: string;
  valor: number;
  icone: string;
  cor: "blue" | "cyan" | "purple" | "orange";
  descricao?: string;
}

export default function StatCard({
  titulo,
  valor,
  icone,
  cor,
  descricao,
}: StatCardProps) {
  return (
    <article className={`stat-card stat-${cor}`}>
      <div className="stat-card-header">
        <span>{titulo}</span>

        <div className="stat-icon">
          {icone}
        </div>
      </div>

      <strong className="stat-value">
        {valor}
      </strong>

      {descricao && (
        <p className="stat-description">
          {descricao}
        </p>
      )}
    </article>
  );
}
