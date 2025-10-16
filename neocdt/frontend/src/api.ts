const API_URL = "http://localhost:4000/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: email, contrasena: password }), // tu backend espera 'correo' y 'contrasena'
  });
  return res.json();
}

export async function getCDTs(token: string) {
  const res = await fetch(`${API_URL}/cdts`, { // <-- ruta correcta
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createCDT(token: string, data: any) {
  const res = await fetch(`${API_URL}/cdts`, { // <-- ruta correcta
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al crear CDT");
  }

  return res.json();
}


