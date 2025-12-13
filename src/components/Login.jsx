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

    <form onSubmit={loginUser} className="p-6 bg-white rounded shadow w-80 mx-auto mt-20">
      <h2 className=" text-xl font-bold mb-4">Login</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 border"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-3 p-2 border"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="bg-blue-600  text-white w-full py-2 rounded">
        Login
      </button>
    </form></>
  );
}
