import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import CDTList from "./Pages/CDTList";
import CDTForm from "./Pages/CDTForm";
import Registro from "./Pages/Registro";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/cdts" element={<CDTList />} />
    <Route path="/cdts/new" element={<CDTForm />} />
  </Routes>

    </BrowserRouter>
  );
}

