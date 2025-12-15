import { useEffect, useRef, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";

import gsap from "gsap";

export default function Gallery() {
  const [uploads, setUploads] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const q = query(collection(db, "uploads"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploads(items);
    });

    return () => unsubscribe();
  }, []);

  // GSAP animation on items load
  useEffect(() => {
    if (!itemRefs.current.length) return;

    gsap.fromTo(
      itemRefs.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      }
    );
  }, [uploads]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await deleteDoc(doc(db, "uploads", id));
    }
  };

  return (
    <>
      {/* Masonry Grid */}
      <Box className="p-4">
        <Masonry columns={{ xs: 2, sm: 3, md: 4 }} spacing={2}>
          {uploads.map((item, index) => (
            <Box
              key={item.id}
              ref={(el) => (itemRefs.current[index] = el)}
              className="relative rounded-2xl overflow-hidden cursor-pointer bg-black"
              onClick={() => setSelectedItem(item)}
            >
              {item.type?.startsWith("image") ? (
                <img
                  src={item.url}
                  alt="upload"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  muted
                  className="w-full h-auto object-cover"
                />
              )}

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="
                  absolute top-2 right-2
                  bg-red-500/20 backdrop-blur-sm
                  text-white text-xs px-2 py-1
                  rounded-full
                  hover:bg-red-500
                  transition z-10
                "
              >
                Delete
              </button>
            </Box>
          ))}
        </Masonry>
      </Box>

      {/* Fullscreen Preview */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedItem(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold"
            onClick={() => setSelectedItem(null)}
          >
            ✕
          </button>

          <div
            className="max-w-5xl max-h-[90vh] w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type?.startsWith("image") ? (
              <img
                src={selectedItem.url}
                alt="fullscreen"
                className="w-full max-h-[90vh] object-contain rounded-xl"
              />
            ) : (
              <video
                src={selectedItem.url}
                controls
                autoPlay
                className="w-full max-h-[90vh] rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
