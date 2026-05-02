import { useState } from 'react';

export default function FeedingResults({ results, onBack, onReset }) {
  const { snakesToFeed, preySummary, week } = results;
  const { confirmed, tentative } = preySummary;

  const regularSnakes = snakesToFeed.filter((s) => !s.inMolt);
  const moltSnakes = snakesToFeed.filter((s) => s.inMolt);

  const totalPrey = confirmed.reduce((s, g) => s + g.total, 0);
  const totalTentative = tentative.reduce((s, g) => s + g.total, 0);

  const handleCopy = () => {
    const lines = [`🐍 Proies à sortir — Semaine ${week}`, ''];
    if (confirmed.length > 0) {
      confirmed.forEach((g) => lines.push(`${g.preySize} : ${g.total}`));
    }
    if (tentative.length > 0) {
      lines.push('');
      lines.push('À vérifier (mue) :');
      tentative.forEach((g) => lines.push(`${g.preySize} : ${g.total} ?`));
    }
    lines.push('');
    lines.push(`Total : ${totalPrey + totalTentative} proie(s)`);
    navigator.clipboard.writeText(lines.join('\n'));
  };

  if (snakesToFeed.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h2>Aucun repas prévu cette semaine</h2>
          <p className="muted">Tous les serpents ont été nourris conformément à leur fréquence.</p>
          <div className="action-row">
            <button className="btn btn-secondary" onClick={onBack}>← Changer de semaine</button>
            <button className="btn btn-outline" onClick={onReset}>Nouveau fichier</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-layout">
      {/* PREY SUMMARY */}
      <div className="card prey-card">
        <div className="card-title-row">
          <h2 className="card-title">🥩 Proies à sortir — S{week}</h2>
          <div className="card-actions">
            <button className="btn-icon-sm" title="Copier la liste" onClick={handleCopy}>📋</button>
            <button className="btn-icon-sm no-print" title="Imprimer" onClick={() => window.print()}>🖨️</button>
          </div>
        </div>

        {confirmed.length > 0 && (
          <>
            <div className="section-label">Confirmées ({totalPrey})</div>
            <ul className="prey-list">
              {confirmed.map((g) => (
                <li key={g.preySize} className="prey-item">
                  <span className="prey-name">{g.preySize}</span>
                  <span className="prey-qty">{g.total}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {tentative.length > 0 && (
          <>
            <div className="section-label tentative">
              En attente de mue ({totalTentative} — à vérifier)
            </div>
            <ul className="prey-list tentative-list">
              {tentative.map((g) => (
                <li key={g.preySize} className="prey-item tentative">
                  <span className="prey-name">{g.preySize}</span>
                  <span className="prey-qty">{g.total}&thinsp;?</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="prey-total">
          Total : <strong>{totalPrey + totalTentative}</strong> proie(s)
          {totalTentative > 0 && <span className="muted"> dont {totalTentative} à confirmer</span>}
        </div>
      </div>

      {/* SNAKE LIST */}
      <div className="card snake-card">
        <h2 className="card-title">🐍 Serpents à nourrir — Semaine {week}</h2>

        {regularSnakes.length > 0 && (
          <>
            <div className="section-label">À nourrir ({regularSnakes.length} groupe(s))</div>
            <SnakeTable snakes={regularSnakes} />
          </>
        )}

        {moltSnakes.length > 0 && (
          <>
            <div className="section-label tentative">En mue récente — à vérifier ({moltSnakes.length} groupe(s))</div>
            <SnakeTable snakes={moltSnakes} isMolt />
          </>
        )}

        <div className="action-row mt-lg no-print">
          <button className="btn btn-secondary" onClick={onBack}>← Changer de semaine</button>
          <button className="btn btn-outline" onClick={onReset}>Nouveau fichier</button>
        </div>
      </div>
    </div>
  );
}

function SnakeTable({ snakes, isMolt = false }) {
  return (
    <div className="table-wrapper">
      <table className="snake-table">
        <thead>
          <tr>
            <th>Espèce</th>
            <th>Taille proie</th>
            <th>Nb</th>
            <th>Fréquence</th>
            <th>Dernier repas</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {snakes.map((snake, i) => (
            <tr key={i} className={isMolt ? 'row-molt' : ''}>
              <td className="td-species">{snake.species}</td>
              <td className="td-prey">
                <span className="prey-badge">{snake.preySize}</span>
              </td>
              <td className="td-center">{snake.nbSpecimens}</td>
              <td className="td-center">
                {snake.freqWeeks === 1 ? 'Chaque sem.' : `/ ${snake.freqWeeks} sem.`}
              </td>
              <td className="td-center">
                {snake.lastMealWeek
                  ? `S${snake.lastMealWeek} (−${snake.weeksSinceLastMeal} sem.)`
                  : <span className="muted">—</span>}
              </td>
              <td className="td-info">
                {isMolt && <span className="badge badge-molt">En mue ?</span>}
                {snake.refusedThisWeek && <span className="badge badge-ref">Refus S{snake.lastMealWeek != null ? snake.lastMealWeek + snake.freqWeeks : week}</span>}
                {!isMolt && !snake.refusedThisWeek && snake.lastRefused && (
                  <span className="badge badge-ref">Refus sem. préc.</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
