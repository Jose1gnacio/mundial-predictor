export default function RulesPage() {
  return (
    <div className="rules-container">
      <h2 className="rules-title">Reglas del Torneo</h2>

      <div className="rules-grid">
        <div className="rule-card">
          <h3>📅 Plazo de Predicción</h3>

          <p>Se puede predecir en cualquier momento.</p>

          <p>El límite para cada partido es a las 23:59 del día anterior.</p>

          <p>Después de ese horario no se podrán realizar modificaciones.</p>
        </div>

        <div className="rule-card">
          <h3>🏆 Sistema de Puntuación</h3>

          <p>Acertar ganador: 1 punto.</p>

          <p>Acertar marcador exacto: 3 puntos adicionales.</p>

          <p>Puntaje máximo por partido: 4 puntos.</p>
        </div>

        <div className="rule-card">
          <h3>🤝 Empates</h3>

          <p>
            Los empates solo otorgarán puntaje completo cuando el marcador sea
            acertado exactamente.
          </p>
        </div>

        <div className="rule-card">
          <h3>⚽ Definición por Penales</h3>

          <p>Los goles de la tanda de penales no se consideran.</p>

          <p>
            Solo se otorgará 1 punto a quienes acierten la selección ganadora.
          </p>
        </div>

        <div className="rule-card">
          <h3>🏅 Clasificación</h3>

          <p>La tabla se actualizará automáticamente durante el torneo.</p>

          <p>Ganará quien acumule más puntos al finalizar el Mundial.</p>
        </div>

        <div className="rule-card">
          <h3>🎁 Premios</h3>

          <p>🥇 Primer Lugar</p>

          <p>🥈 Segundo Lugar</p>

          <p>🥉 Tercer Lugar</p>

          <p>
            Los premios serán informados una vez finalizadas las inscripciones.
          </p>
        </div>
      </div>
    </div>
  );
}
