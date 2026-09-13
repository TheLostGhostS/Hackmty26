import MoldeableBox from "./Moldeables/MoldeableBox";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/Trustbar";
import Products from "./components/Products";
import Security from "./components/Security";
import CTAFooter from "./components/CTAfooter";
import Footer from "./components/Footer";
import Botones from "./Moldeables/Botones";
import SlideBarXY from "./Moldeables/SlideBarXY";
import MultiOpt from "./Moldeables/MultiOpt" ;
import AIBox from "./Moldeables/AIBox";
import GraphB from "./Moldeables/GraphB";
import GraphL from "./Moldeables/GraphL";
import GraphP from "./Moldeables/GraphP";
import Check from "./Moldeables/Check";

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
      <MoldeableBox />
      <Botones />
      <MultiOpt />
      <SlideBarXY />
      <AIBox />
      <GraphB />
      <GraphL />
      <GraphP />
      <Check />
    </div>
  );
}
