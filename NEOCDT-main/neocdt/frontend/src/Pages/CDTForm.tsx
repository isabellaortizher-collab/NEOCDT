import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCDT } from "../api";

export default function CDTForm() {
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token de sesión. Inicia sesión nuevamente.");
      return;
    }

    try {
      const data = await createCDT(token, { monto: Number(monto), plazo: Number(plazo) });
      navigate("/cdts"); // SPA friendly
    } catch (err: any) {
      setError(err.message || "Error al crear CDT");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h1>Nuevo CDT</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <input
          type="number"
          placeholder="Plazo (días)"
          value={plazo}
          onChange={(e) => setPlazo(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>Abrir CDT</button>
      </form>
    </div>
  );
}




