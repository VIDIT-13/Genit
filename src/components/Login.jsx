import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <form
        onSubmit={loginUser}
        className="p-8 bg-white rounded-3xl shadow-2xl w-80 mx-auto mt-20 font-poppins
                   border-2 border-gray-300 transition-all duration-500 hover:scale-105 hover:border-black"
      >
        <h2 className="text-amber-950 text-3xl mb-6 font-semibold">Who Are U 🙂</h2>

        <input
          type="email"
          placeholder="Email"
          className="font-poppins w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="bg-black text-white w-full py-3 rounded-xl transition-colors duration-500 
                     hover:bg-white hover:text-black border border-black"
        >
          Login
        </button>
      </form>
    </>
  );
}
