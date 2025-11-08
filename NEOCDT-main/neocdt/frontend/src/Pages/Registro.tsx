import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreUsuario, nombreCompleto, correo, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en registro");
        return;
      }

      alert("Registro exitoso");
      navigate("/"); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Registro</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre de usuario</label>
          <input type="text" className="form-control" value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Nombre completo</label>
          <input type="text" className="form-control" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Correo</label>
          <input type="email" className="form-control" value={correo} onChange={e => setCorreo(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input type="password" className="form-control" value={contrasena} onChange={e => setContrasena(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-success">Registrarse</button>
      </form>
    </div>
  );
}

