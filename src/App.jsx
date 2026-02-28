import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Shop from "./pages/Shop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import ContactSeller from "./pages/ContactSeller";
import SellerDashboard from "./pages/SellerDashboard";

import "./App.css";

function App() {

  return (

    <ErrorBoundary>

      <AuthProvider>

        <CartProvider>

          <BrowserRouter>

            <Navbar />

            <main className="app-main">

              <Routes>

                {/* PUBLIC */}
                <Route
                  path="/"
                  element={<Home />}
                />

                <Route
                  path="/login"
                  element={<Login />}
                />
                <Route path="/shop" element={<Shop />} />
                

                <Route
                  path="/register"
                  element={<Register />}
                />


                {/* PRODUCT */}
                <Route
                  path="/product/:id"
                  element={<ProductDetails />}
                />


                {/* SHOPPING */}
                <Route
                  path="/cart"
                  element={<Cart />}
                />

                <Route
                  path="/checkout"
                  element={<Checkout />}
                />

                <Route
                  path="/payment"
                  element={<Payment />}
                />


                {/* USER */}
                <Route
                  path="/orders"
                  element={<Orders />}
                />

                <Route
                  path="/contact-seller/:sellerId"
                  element={<ContactSeller />}
                />


                {/* SELLER DASHBOARD */}
                <Route
                  path="/dashboard"
                  element={<SellerDashboard />}
                />

                {/* alias (prevents vendor/dashboard error) */}
                <Route
                  path="/vendor/dashboard"
                  element={<SellerDashboard />}
                />


                {/* fallback */}
                <Route
                  path="*"
                  element={<Home />}
                />

              </Routes>

            </main>

            <Footer />

          </BrowserRouter>

        </CartProvider>

      </AuthProvider>

    </ErrorBoundary>

  );

}

export default App;