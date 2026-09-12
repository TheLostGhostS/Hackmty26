import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/Trustbar";
import Products from "./components/Products";
import Security from "./components/Security";
import CTAFooter from "./components/CTAfooter";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Hero />
      <TrustBar />
      <Products />
      <Security />
      <CTAFooter />
      <Footer />
    </div>
  );
}