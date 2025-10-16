import { useEffect, useState } from "react";
import { getCDTs } from "../api";

export default function CDTList() {
  const [cdts, setCdts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/";
    getCDTs(token!).then(setCdts);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mis CDTs</h1>
      <a
        href="/cdts/new"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Crear nuevo CDT
      </a>
      <ul className="mt-4">
        {cdts.map((cdt: any) => (
          <li key={cdt._id} className="border p-2 my-2 rounded">
            <p>Monto: {cdt.monto}</p>
            <p>Plazo: {cdt.plazo} días</p>
            <p>Estado: {cdt.estado}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
