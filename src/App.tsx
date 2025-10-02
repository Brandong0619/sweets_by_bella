import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import AdminDashboard from "./pages/AdminDashboard";
// import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        {/* {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)} */}
      </>
    </Suspense>
  );
}

export default App;
