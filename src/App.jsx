import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
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
import BecomeSeller from "./pages/BecomeSeller";
import AdminDashboard from "./pages/AdminDashboard";
import Inbox from "./pages/Inbox";
import Profile from "./pages/Profile";

import "./App.css";

function App() {

  return (

    <ErrorBoundary>

      <AuthProvider>

        <CartProvider>

          <BrowserRouter>

            <ScrollToTop />
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


                {/* INBOX */}
                <Route
                  path="/inbox"
                  element={<Inbox />}
                />

                {/* BECOME A SELLER */}
                <Route
                  path="/become-seller"
                  element={<BecomeSeller />}
                />

                {/* ADMIN */}
                <Route
                  path="/admin"
                  element={<AdminDashboard />}
                />

                {/* PROFILE */}
                <Route
                  path="/profile"
                  element={<Profile />}
                />

                {/* ABOUT */}
                <Route
                  path="/about"
                  element={<About />}
                />

                {/* fallback */}
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
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