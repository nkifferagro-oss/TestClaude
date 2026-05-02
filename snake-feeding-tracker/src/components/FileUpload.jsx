import { useRef, useState } from 'react';

const ACCEPTED = '.xlsx,.xls,.csv,.ods';

export default function FileUpload({ onFileUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      await onFileUpload(file);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="card upload-card">
      <h2 className="card-title">Importer le tableur de suivi</h2>
      <p className="card-desc">
        Chargez votre fichier Excel (.xlsx / .xls), CSV ou ODS contenant les données de nourrissage.
      </p>

      <div
        className={`drop-zone ${dragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {loading
          ? <div className="drop-icon">⏳</div>
          : <div className="drop-icon">📂</div>}
        <p className="drop-text">
          {loading ? 'Chargement en cours…' : 'Cliquer ou déposer le fichier ici'}
        </p>
        <p className="drop-hint">{ACCEPTED}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <div className="format-info">
        <div className="format-header">
          <h3>Format attendu du tableur :</h3>
          <a
            href="exemple_suivi.xlsx"
            download
            className="btn btn-outline btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            ⬇ Télécharger un exemple
          </a>
        </div>

        <div className="table-wrapper">
          <table className="format-table">
            <thead>
              <tr>
                <th>A — Espèce</th>
                <th>B — Nb</th>
                <th>C — Taille proie</th>
                <th>D — Fréquence</th>
                <th>E — S1</th>
                <th>F — S2</th>
                <th>… — Sn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ball python</td>
                <td>2</td>
                <td>Souris M</td>
                <td>7j</td>
                <td className="status-ok">ok</td>
                <td className="status-ref">ref</td>
                <td>…</td>
              </tr>
              <tr>
                <td>Boa constrictor</td>
                <td>1</td>
                <td>Rat S</td>
                <td>14j</td>
                <td className="status-ok">ok</td>
                <td className="status-m">M</td>
                <td>…</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legend">
          <span className="legend-item"><b className="status-ok">ok</b> Repas accepté</span>
          <span className="legend-item"><b className="status-ref">ref</b> Proie refusée</span>
          <span className="legend-item"><b>p</b> Pas de repas</span>
          <span className="legend-item"><b className="status-m">M</b> En mue</span>
          <span className="legend-item"><b className="status-g">G</b> Gavage</span>
          <span className="legend-item"><b className="status-sg">SG</b> Semi-gavage</span>
        </div>
      </div>
    </div>
  );
}
