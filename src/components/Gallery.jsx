import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export default function Gallery() {
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "uploads"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploads(items);
    });

    return () => unsubscribe();
  }, []);

  // Delete Firestore metadata
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await deleteDoc(doc(db, "uploads", id));
      alert("Deleted metadata from Firestore ✅");

      // Optional: You can also delete from Cloudinary (requires backend)
      // See Step 2 below
    }
  };

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {uploads.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden relative">
          {item.type.startsWith("image") ? (
            <img src={item.url} alt="upload" className="w-full h-60 object-cover" />
          ) : (
            <video src={item.url} className="w-full h-60 object-cover" controls />
          )}

          <button
            onClick={() => handleDelete(item.id)}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
