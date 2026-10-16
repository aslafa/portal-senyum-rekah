"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthUserChanged } from "./auth";
import {
  INITIAL_USERS,
  INITIAL_LAYANAN,
  INITIAL_JADWAL_DOKTER,
  INITIAL_JANJI,
  INITIAL_CATATAN
} from "./data";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [layanan, setLayanan] = useState(INITIAL_LAYANAN);
  const [jadwalDokter, setJadwalDokter] = useState(INITIAL_JADWAL_DOKTER);
  const [janjiTemu, setJanjiTemu] = useState(INITIAL_JANJI);
  const [catatanPerawatan, setCatatanPerawatan] = useState(INITIAL_CATATAN);

  // Default active user adalah null (harus berasal dari sesi Firebase Auth nyata)
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);

  // Load from localStorage on client mount (data mock klinik, tanpa memaksakan active user demo)
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem("psr_users");
      const savedLayanan = localStorage.getItem("psr_layanan");
      const savedJadwal = localStorage.getItem("psr_jadwal");
      const savedJanji = localStorage.getItem("psr_janji");
      const savedCatatan = localStorage.getItem("psr_catatan");

      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedLayanan) setLayanan(JSON.parse(savedLayanan));
      if (savedJadwal) setJadwalDokter(JSON.parse(savedJadwal));
      if (savedJanji) setJanjiTemu(JSON.parse(savedJanji));
      if (savedCatatan) setCatatanPerawatan(JSON.parse(savedCatatan));
    } catch (e) {
      console.error("Failed to load local storage state", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listener otomatis Firebase Auth: menyinkronkan currentUserId dengan sesi autentikasi nyata
  useEffect(() => {
    const unsubscribe = onAuthUserChanged((authUser, profile) => {
      if (authUser && profile) {
        setUsers((prev) => {
          const index = prev.findIndex((u) => u.id === authUser.uid);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...profile, id: authUser.uid };
            return updated;
          }
          return [...prev, { id: authUser.uid, ...profile }];
        });
        setCurrentUserId(authUser.uid);
      } else {
        // Pengguna tidak login atau telah keluar
        setCurrentUserId(null);
      }
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("psr_users", JSON.stringify(users));
      localStorage.setItem("psr_layanan", JSON.stringify(layanan));
      localStorage.setItem("psr_jadwal", JSON.stringify(jadwalDokter));
      localStorage.setItem("psr_janji", JSON.stringify(janjiTemu));
      localStorage.setItem("psr_catatan", JSON.stringify(catatanPerawatan));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [users, layanan, jadwalDokter, janjiTemu, catatanPerawatan, isLoaded]);

  // Pengguna aktif HANYA ada jika ada pengguna terautentikasi (tidak ada fallback akun demo)
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) || null : null;

  const switchUser = (userId) => {
    // Sesuai aturan: tidak mengizinkan pengalihan peran demo tanpa autentikasi nyata
    console.warn("switchUser dinonaktifkan: Akses pengguna dikontrol penuh oleh Firebase Authentication.");
  };

  // Helper getters
  const getUserById = (id) => users.find((u) => u.id === id);
  const getLayananById = (id) => layanan.find((l) => l.id === id);
  const getDokterList = () => users.filter((u) => u.role === "dokter" && u.aktif);
  const getPasienList = () => users.filter((u) => u.role === "pasien");

  // Actions
  const addJanji = (data) => {
    const newId = "janji-" + Date.now();
    const newJanji = {
      id: newId,
      pasienId: data.pasienId || currentUser.id,
      dokterId: data.dokterId,
      layananId: data.layananId,
      tanggal: data.tanggal,
      jam: data.jam,
      keluhan: data.keluhan || "",
      status: "menunggu",
      alasanBatal: "",
      dibuatPada: new Date().toISOString()
    };
    setJanjiTemu((prev) => [newJanji, ...prev]);
    return newJanji;
  };

  const updateJanjiStatus = (janjiId, status, alasanBatal = "") => {
    setJanjiTemu((prev) =>
      prev.map((j) =>
        j.id === janjiId
          ? {
              ...j,
              status,
              alasanBatal: alasanBatal || j.alasanBatal
            }
          : j
      )
    );
  };

  const rescheduleJanji = (janjiId, tanggal, jam) => {
    setJanjiTemu((prev) =>
      prev.map((j) =>
        j.id === janjiId
          ? {
              ...j,
              tanggal,
              jam,
              status: "dikonfirmasi"
            }
          : j
      )
    );
  };

  const addCatatanPerawatan = (janjiId, tindakan, catatan) => {
    const janji = janjiTemu.find((j) => j.id === janjiId);
    if (!janji) return;

    const newCatatan = {
      id: "catatan-" + Date.now(),
      janjiId,
      pasienId: janji.pasienId,
      dokterId: janji.dokterId,
      tindakan,
      catatan,
      dibuatPada: new Date().toISOString()
    };

    setCatatanPerawatan((prev) => [newCatatan, ...prev]);

    // Update appointment status to 'selesai'
    updateJanjiStatus(janjiId, "selesai");
    return newCatatan;
  };

  const updateUserProfile = (userId, data) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              nama: data.nama !== undefined ? data.nama : u.nama,
              noHp: data.noHp !== undefined ? data.noHp : u.noHp
            }
          : u
      )
    );
  };

  const updateUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const toggleUserActive = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, aktif: !u.aktif } : u))
    );
  };

  const addLayanan = (layananData) => {
    const newLayanan = {
      id: "lay-" + Date.now(),
      nama: layananData.nama,
      durasiMenit: Number(layananData.durasiMenit) || 30,
      harga: Number(layananData.harga) || 0,
      aktif: layananData.aktif !== undefined ? Boolean(layananData.aktif) : true
    };
    setLayanan((prev) => [...prev, newLayanan]);
    return newLayanan;
  };

  const toggleLayananActive = (layananId) => {
    setLayanan((prev) =>
      prev.map((l) => (l.id === layananId ? { ...l, aktif: !l.aktif } : l))
    );
  };

  const addJadwalDokter = (jadwalData) => {
    const newJadwal = {
      id: "jadwal-" + Date.now(),
      dokterId: jadwalData.dokterId,
      hari: jadwalData.hari.toLowerCase(),
      jamMulai: jadwalData.jamMulai,
      jamSelesai: jadwalData.jamSelesai
    };
    setJadwalDokter((prev) => [...prev, newJadwal]);
    return newJadwal;
  };

  const deleteJadwalDokter = (jadwalId) => {
    setJadwalDokter((prev) => prev.filter((j) => j.id !== jadwalId));
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setLayanan(INITIAL_LAYANAN);
    setJadwalDokter(INITIAL_JADWAL_DOKTER);
    setJanjiTemu(INITIAL_JANJI);
    setCatatanPerawatan(INITIAL_CATATAN);
    setCurrentUserId("user-andi");
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        isLoaded,
        users,
        layanan,
        jadwalDokter,
        janjiTemu,
        catatanPerawatan,
        currentUser,
        switchUser,
        getUserById,
        getLayananById,
        getDokterList,
        getPasienList,
        addJanji,
        updateJanjiStatus,
        rescheduleJanji,
        addCatatanPerawatan,
        updateUserProfile,
        updateUserRole,
        toggleUserActive,
        addLayanan,
        toggleLayananActive,
        addJadwalDokter,
        deleteJadwalDokter,
        resetAllData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
