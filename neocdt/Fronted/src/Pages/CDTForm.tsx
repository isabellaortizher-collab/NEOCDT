import { useState } from "react";
import { createCDT } from "../api";

export default function CDTForm() {
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = await createCDT(token!, { monto, plazo });
    if (data._id) window.location.href = "/cdts";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nuevo CDT</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Plazo (días)"
          value={plazo}
          onChange={(e) => setPlazo(e.target.value)}
          className="border p-2 rounded"
        />
        <button className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Guardar
        </button>
      </form>
    </div>
  );
}
