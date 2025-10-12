const API_URL = "http://localhost:4000/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getCDTs(token: string) {
  const res = await fetch(`${API_URL}/cdt`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createCDT(token: string, data: any) {
  const res = await fetch(`${API_URL}/cdt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
