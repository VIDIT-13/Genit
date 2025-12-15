import { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Login from "./components/Login";
import Upload from "./components/Upload";
import Gallery from "./components/Gallery";

import SplashCursor from "./ReactBits/SplashCursor";
import BlurText from "./ReactBits/BlurText";
import GradientBlinds from "./ReactBits/GradientBlinds.jsx";

function MenuDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* 3-bar button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-1 px-3 py-2"
      >
        <span className="w-6 h-0.5 bg-white"></span>
        <span className="w-6 h-0.5 bg-white"></span>
        <span className="w-6 h-0.5 bg-white"></span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-3 w-40 bg-black border border-white/20 rounded-xl shadow-lg overflow-hidden z-50">
          {["Gallery", "Upload", "Notes", "Timeline"].map((item) => (
            <button
              key={item}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black transition"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [user, setUser] = useState(null);
  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        {/* Gradient Background (LOGIN ONLY) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <GradientBlinds
            gradientColors={["#FF9FFC", "#5227FF"]}
            angle={0}
            noise={0.3}
            blindCount={12}
            blindMinWidth={50}
            spotlightRadius={0.5}
            spotlightSoftness={1}
            spotlightOpacity={1}
            mouseDampening={0.15}
            distortAmount={0}
            shineDirection="left"
            mixBlendMode="lighten"
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none" />

        <SplashCursor />

        {/* Login Form */}
        <div className="relative z-20 flex items-center justify-center w-full h-full">
          <Login />
        </div>
      </div>
    );
  }

  /* ================= LOGGED-IN APP (NO GRADIENT) ================= */

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <SplashCursor />

      {/* App Content */}
      <div className="relative z-10 min-h-screen text-white pb-12 border-b-8 border-amber-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <BlurText
            text="JanashVidit"
            delay={150}
            animateBy="letters"
            direction="top"
            className="text-2xl"
          />

          

          <button
            onClick={() => signOut(auth)}
            className="
    bg-red-500 text-black
    px-3 py-0 rounded-3xl
    hover:bg-white 
    transition
  "
          >
            <BlurText
              text="Logout"
              delay={150}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-1xl m-0.5 "
            />
          </button>
        </div>

        <Upload />
        <Gallery />
      </div>
    </div>
  );
}
