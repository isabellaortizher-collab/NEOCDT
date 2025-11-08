import React, { useMemo, useState } from "react";

/** Página Tasas (incluye simulador inline, sin components) */
export default function Tasas() {
  const [monto, setMonto] = useState(0);
  const [plazoDias, setPlazoDias] = useState(0);
  const [tasaEA, setTasaEA] = useState(0);
  const [gmfActivo, setGmfActivo] = useState(true);
  const [retencionPct, setRetencionPct] = useState(4);
  const [baseDias, setBaseDias] = useState<365 | 360>(365);

  const res = useMemo(() => {
    const ea = tasaEA / 100;
    const beneficioGMF = gmfActivo ? monto * 0.004 : 0;
    const totalInicial = monto + beneficioGMF;
    const rDia = Math.pow(1 + ea, 1 / baseDias) - 1;
    const rendimiento = totalInicial * (Math.pow(1 + rDia, plazoDias) - 1);
    const retencion = rendimiento * (retencionPct / 100);
    const totalVenc = totalInicial + rendimiento - retencion;
    return { beneficioGMF, totalInicial, rendimiento, retencion, totalVenc };
  }, [monto, plazoDias, tasaEA, gmfActivo, retencionPct, baseDias]);

  return (
    <div>
      <style>{css}</style>
      <div className="wrap">
        <h2 className="pageTitle">Simulador de CDT</h2>

        <section className="card">
          <h3 className="cardTitle">Parámetros</h3>
          <div className="formGrid">
            <label className="field">
              <span>Monto</span>
              <input type="number" value={monto} onChange={e=>setMonto(Number(e.target.value))}/>
            </label>
            <label className="field">
              <span>Plazo (días)</span>
              <input type="number" value={plazoDias} onChange={e=>setPlazoDias(Number(e.target.value))}/>
            </label>
            <label className="field">
              <span>Tasa EA (%)</span>
              <input type="number" step="0.01" value={tasaEA} onChange={e=>setTasaEA(Number(e.target.value))}/>
            </label>
            <label className="field">
              <span>Retención (%)</span>
              <input type="number" step="0.01" value={retencionPct} onChange={e=>setRetencionPct(Number(e.target.value))}/>
            </label>
            <label className="field checkbox">
              <input type="checkbox" checked={gmfActivo} onChange={e=>setGmfActivo(e.target.checked)}/>
              <span>Beneficio GMF (4×1000)</span>
            </label>
            <label className="field">
              <span>Base de días</span>
              <select value={baseDias} onChange={e=>setBaseDias(Number(e.target.value) as 365 | 360)}>
                <option value={365}>365 (civil)</option>
                <option value={360}>360 (comercial)</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card">
          <h3 className="resultsTitle">Resultado del CDT</h3>
          <div className="rows">
            <Row label="Monto Inicial" value={fmt(monto)} />
            <Row label="Beneficio GMF (4x1000)" value={fmt(res.beneficioGMF)} info />
            <Row label="Total Inicial" value={fmt(res.totalInicial)} divider />
            <Row label={`Rendimiento ${plazoDias} días`} value={fmt(res.rendimiento)} />
            <Row label="Tasa de Interés EA" value={`${tasaEA.toFixed(2)} %`} />
            <Row label={`Retención en la fuente ${retencionPct.toFixed(2)} %`} value={fmt(res.retencion)} info divider />
            <Row highlight label={<>Rentabilidad de tu CDT al <br/> vencimiento</>} value={fmt(res.totalVenc)} />
          </div>
          <div className="ctaBox"><button className="btnPrimary">Quiero mi CDT</button></div>
        </section>
      </div>
    </div>
  );
}

function Row({label,value,divider,highlight,info}:{label:React.ReactNode;value:React.ReactNode;divider?:boolean;highlight?:boolean;info?:boolean;}){
  return (
    <div className={`row ${divider?'row--divider':''} ${highlight?'row--hl':''}`}>
      <div className="label">{label}{info && <span className="info">i</span>}</div>
      <div className="val">{value}</div>
    </div>
  );
}
function fmt(n:number){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:2}).format(n);}

const css = `
:root{--brand:#e11d2e;--brand-dark:#c01222;--bg:#f5f6f8;--card:#fff;--ring:#eceff3;--muted:#6b7280;--ink:#111827;}
*{box-sizing:border-box} body{margin:0} .wrap{max-width:960px;margin:0 auto;padding:24px 16px}
.pageTitle{margin:8px 0 16px;font-size:28px;letter-spacing:-.02em}
.card{background:var(--card);border:1px solid var(--ring);border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.04);padding:18px;margin-bottom:18px}
.cardTitle{margin:0 0 12px;font-size:18px}
.formGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (max-width:860px){.formGrid{grid-template-columns:1fr 1fr}} @media (max-width:560px){.formGrid{grid-template-columns:1fr}}
.field{display:flex;flex-direction:column;gap:6px} .field span{font-size:13px;color:var(--muted)}
.field input,.field select{height:40px;border-radius:12px;border:1px solid #d6dbe2;padding:0 12px;font-size:14px;background:#fff}
.field.checkbox{flex-direction:row;align-items:center;gap:10px}
.resultsTitle{text-align:center;font-size:22px;margin:8px 0 12px}
.rows{margin-top:8px}
.row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:14px 4px}
.row--divider{border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
.label{font-weight:600} .val{font-weight:800}
.info{display:inline-grid;place-items:center;margin-left:8px;height:18px;width:18px;border-radius:50%;background:#fef2f2;color:#ef4444;font-weight:800;font-size:12px}
.row--hl{background:#f3f7fb;border-radius:12px;margin:10px 0;padding:18px 10px}
.ctaBox{display:grid;place-items:center;margin-top:18px}
.btnPrimary{height:48px;padding:0 26px;border-radius:24px;border:0;background:var(--brand);color:#fff;font-weight:800;font-size:16px;cursor:pointer;transition:.15s}
.btnPrimary:hover{background:var(--brand-dark)}
`;