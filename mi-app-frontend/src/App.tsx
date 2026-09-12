<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
//import Navbar from "./components/Navbar";
//import Hero from "./components/Hero";
//import TrustBar from "./components/Trustbar";
//import Products from "./components/Products";
//import Security from "./components/Security";
//import CTAFooter from "./components/CTAfooter";
//import Footer from "./components/Footer";
//import TextInput from "./components/TextInput";
//import Botones from "./Moldeables/Botones";
//import MoldeableBox from "./Moldeables/MoldeableBox";

import ChatPage from "./pages/Chatpage"


export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <ChatPage/>
    </div>
  );
}
=======
=======
>>>>>>> 381d53c (FrontEndBase)
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
=======
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/Trustbar";
import Products from "./components/Products";
import Security from "./components/Security";
import CTAFooter from "./components/CTAfooter";
import Footer from "./components/Footer";
>>>>>>> f83c062 (First interface)

export default function App() {
  return (
<<<<<<< HEAD
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

<<<<<<< HEAD
export default App
<<<<<<< HEAD
>>>>>>> 0d46b38 (BorrandoLoInutil)
=======
>>>>>>> 381d53c (FrontEndBase)
=======
    <div className="min-h-screen bg-paper">
=======
type Direction = "right" | "bottom" | "corner";



const ResizableBox: React.FC = () => {
  const [size, setSize] = useState<Size>({ width: 300, height: 200 });
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const MIN_WIDTH = 100;
  const MAX_WIDTH = 1470;
  const MIN_HEIGHT = 80;
  const MAX_HEIGHT = 800;

  const handleMouseDown = useCallback(
    (direction: Direction) => (e: React.MouseEvent) => {
      e.preventDefault();
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      };

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startPos.current.x;
        const dy = moveEvent.clientY - startPos.current.y;

        setSize((prev) => {
          let newWidth = prev.width;
          let newHeight = prev.height;

          if (direction === "right" || direction === "corner") {
            newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startPos.current.width + dx));
          }
          if (direction === "bottom" || direction === "corner") {
            newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startPos.current.height + dy));
          }
          return { width: newWidth, height: newHeight };
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [size]
  );

  return (
    <><div className="min-h-screen bg-paper">
>>>>>>> 6a31a97 (MoldeableBox)
      <Navbar />
      <Hero />
      <TrustBar />
      <Products />
      <Security />
      <CTAFooter />
      <Footer />
    </div>
<<<<<<< HEAD
=======
    
    <div
      ref={containerRef}
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        border: "2px solid #9E0C24",
        borderRadius: 8,
        background: "#F1E9E1",
        userSelect: "none",
      }}
    >
      <div style={{ padding: 10 }}>---</div>

      {/* Handle derecho */}
      <div
        onMouseDown={handleMouseDown("right")}
        style={{
          position: "absolute",
          top: 0,
          right: -3,
          width: 6,
          height: "100%",
          cursor: "ew-resize",
        }}
      />

      {/* Handle inferior */}
      <div
        onMouseDown={handleMouseDown("bottom")}
        style={{
          position: "absolute",
          bottom: -3,
          left: 0,
          width: "100%",
          height: 6,
          cursor: "ns-resize",
        }}
      />

      {/* Handle esquina */}
      <div
        onMouseDown={handleMouseDown("corner")}
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          width: 12,
          height: 12,
          cursor: "nwse-resize",
          background: "#4f46e5",
          borderRadius: "50%",
        }}
      />
    </div>

    </>
>>>>>>> 6a31a97 (MoldeableBox)
  );
}
>>>>>>> f83c062 (First interface)
