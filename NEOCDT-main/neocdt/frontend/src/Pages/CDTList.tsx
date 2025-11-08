import React, { useEffect, useState } from "react";
import { getCDTs } from "../api"; // ajusta la ruta si es necesario

export default function NEOCDTList() {
  const [cdts, setCdts] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/";
    getCDTs(token!).then(setCdts);
  }, []);

  return (
    <div className="app">
      {/* ---- CSS puro, incrustado ---- */}
      <style>{css}</style>

      {/* Top bar */}
      <div className="topbar">
        <div className="wrap topbar__content">
          <a href="#" className="toplink">
            <span className="icon" aria-hidden>🎧</span> Contáctanos
          </a>
          <a href="#" className="toplink">
            <span className="icon" aria-hidden>❓</span> Preguntas frecuentes
          </a>
        </div>
      </div>

      {/* Header / Navbar */}
      <header className="header">
        <div className="wrap nav">
          <a href="/" className="brand">
            <div className="brand__dot">N</div>
            <span className="brand__text"><span className="brand__neo">NEO</span>CDT</span>
          </a>

          <nav className="nav__links">
            <a href="#" className="navlink">CDT NEOCDT</a>
            <a href="#" className="navlink">Quiénes somos</a>
            <a href="/tasas" className="navlink">Simulador</a>
          </nav>

          <div className="nav__actions">
            <a href="/registro" className="btn btn--primary">Hazte cliente</a>
          </div>

          <button
            className="hamburger"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(v => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobilemenu">
            <nav className="mobilemenu__links">
              <a href="#" className="navlink">CDT NEOCDT</a>
              <a href="#" className="navlink">Quiénes somos</a>
              <a href="#" className="navlink">Tasas</a>
            </nav>
            <div className="mobilemenu__actions">
              <a href="/registro" className="btn btn--primary wfull">Hazte cliente</a>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="wrap main">
        <section className="card">
          <div className="card__head">
            <h1 className="title">Mis CDTs</h1>
            <a href="/cdts/new" className="btn btn--success">Crear nuevo CDT</a>
          </div>

          <div className="card__body">
            {cdts.length > 0 ? (
              <ul className="grid">
                {cdts.map((cdt: any) => (
                  <li key={cdt._id} className="cdt">
                    <div className="cdt__row">
                      <span className="muted">Estado</span>
                      <strong className={`status ${statusClass(cdt.estado)}`}>{cdt.estado}</strong>
                    </div>
                    <div className="cdt__grid">
                      <div>
                        <p className="muted">Monto</p>
                        <p className="big">
                          ${Intl.NumberFormat().format(cdt.monto)}
                        </p>
                      </div>
                      <div>
                        <p className="muted">Plazo</p>
                        <p className="big">{cdt.plazo} días</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">
                <h3>Aún no tienes CDTs</h3>
                <p>Crea tu primer CDT para empezar a invertir con NEOCDT.</p>
                <a href="/cdts/new" className="btn btn--success">Crear nuevo CDT</a>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="wrap footer">
        © {new Date().getFullYear()} <strong>NEOCDT</strong>. Todos los derechos reservados.
      </footer>
    </div>
  );
}

/* --- helpers --- */
function statusClass(estado?: string) {
  const s = (estado || "").toLowerCase();
  if (s === "activo") return "status--ok";
  if (s === "vencido") return "status--bad";
  return "status--neutral";
}

/* --- CSS (sin Tailwind) --- */
const css = `
:root{
  --brand:#e11d2e;        
  --brand-dark:#c01222;
  --ink:#111827;
  --muted:#6b7280;
  --bg:#f7f8fa;
  --card:#ffffff;
  --ring:#eef0f3;
  --ok:#059669;
  --ok-dark:#047857;
  --bad:#dc2626;
}

*{box-sizing:border-box}
html,body,#root,.app{height:100%}
body{margin:0;color:var(--ink);background:var(--bg);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji',sans-serif}
a{text-decoration:none;color:inherit}

.wrap{max-width:1120px;margin:0 auto;padding:0 16px}

/* Topbar */
.topbar{background:#000;color:#fff}
.topbar__content{display:flex;gap:24px;justify-content:flex-end;align-items:center;padding:8px 0}
.toplink{opacity:.9}
.toplink:hover{opacity:1}
.icon{display:inline-block}

/* Header / Navbar */
.header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.95);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--ring)}
.nav{display:flex;align-items:center;justify-content:space-between;padding:12px 0}
.brand{display:flex;align-items:center;gap:10px}
.brand__dot{height:36px;width:36px;border-radius:999px;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:800}
.brand__text{font-size:22px;font-weight:800;letter-spacing:-.02em}
.brand__neo{color:var(--brand)}
.nav__links{display:flex;gap:28px}
.navlink{color:#374151;font-weight:600}
.navlink:hover{color:var(--brand)}
.nav__actions{display:flex;gap:10px}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 18px;border-radius:999px;font-weight:700;border:1px solid transparent;transition:.15s}
.btn--primary{background:var(--brand);color:#fff}
.btn--primary:hover{background:var(--brand-dark)}
.btn--ghost{border-color:#111;color:#111;background:#fff}
.btn--ghost:hover{background:#f3f4f6}
.btn--success{background:var(--ok);color:#fff;border-color:var(--ok)}
.btn--success:hover{background:var(--ok-dark)}
.wfull{width:100%}

/* Mobile */
.hamburger{display:none;border:1px solid #d1d5db;background:#fff;border-radius:10px;padding:8px 10px}
.hamburger span{display:block;height:2px;width:18px;background:#111;margin:3px 0;border-radius:2px}
.mobilemenu{border-top:1px solid var(--ring);padding:12px 16px}
.mobilemenu__links{display:flex;flex-direction:column;gap:10px;margin-bottom:10px}
.mobilemenu__actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}

@media (max-width: 860px){
  .nav__links,.nav__actions{display:none}
  .hamburger{display:inline-flex}
}

/* Main / Card */
.main{padding:32px 0}
.card{background:var(--card);border:1px solid var(--ring);border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.04)}
.card__head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px;border-bottom:1px solid var(--ring)}
.title{margin:0;font-size:28px;letter-spacing:-.02em}
.card__body{padding:20px}

/* Empty state */
.empty{border:1px dashed #cfd6dd;background:#f9fafb;border-radius:14px;padding:28px;text-align:center}
.empty h3{margin:0 0 6px;font-size:20px}
.empty p{margin:0 0 16px;color:var(--muted)}

/* List */
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
@media (max-width: 720px){ .grid{grid-template-columns:1fr} }

.cdt{border:1px solid var(--ring);border-radius:14px;padding:14px;background:#fff;transition:box-shadow .15s}
.cdt:hover{box-shadow:0 8px 22px rgba(0,0,0,.06)}
.cdt__row{display:flex;align-items:center;justify-content:space-between}
.cdt__grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
.muted{color:var(--muted);font-size:13px}
.big{font-weight:700;font-size:18px}
.status{font-weight:800}
.status--ok{color:var(--ok)}
.status--bad{color:var(--bad)}
.status--neutral{color:#374151}

/* Footer */
.footer{padding:28px 0;color:#6b7280;font-size:14px}
`;

