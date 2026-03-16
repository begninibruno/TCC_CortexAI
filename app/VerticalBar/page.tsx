"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerticalBar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Barra superior */}
      <header className="h-16 bg-gray-900 text-white flex items-center px-6 relative z-50">
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl mr-4"
        >
          ☰
        </button>

        <h1 className="font-bold text-xl">CortexAI</h1>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Menu</h2>

          <button
            onClick={() => setOpen(false)}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>

          <Link href="/Login" onClick={() => setOpen(false)}>Login</Link>

          <Link href="/Cadastro" onClick={() => setOpen(false)}>Cadastro</Link>

          <Link href="/Produtos" onClick={() => setOpen(false)}>Meus Produtos</Link>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>

    </div>
  );
}