import { HashRouter, Route, Routes } from "react-router-dom";
import Compare from "./pages/Compare";
import DealDetails from "./pages/DealDetails";
import Deals from "./pages/Deals";
import Home from "./pages/Home";
import Switch from "./pages/Switch";
import { AppStateProvider } from "./store/AppState";

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/deal/:id" element={<DealDetails />} />
          <Route path="/switch" element={<Switch />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}
