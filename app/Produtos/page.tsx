"use client";

import { useState } from "react";
import Image from "next/image";
import VerticalBar from "../VerticalBar/page";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  quantidade: number;
  imagem: string;
};

export default function Produtos() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const [produtos] = useState<Produto[]>([
    {
      id: 1,
      nome: "Notebook Dell",
      descricao: "Notebook para trabalho e estudos",
      quantidade: 5,
      imagem: "/file.svg",
    },
    {
      id: 2,
      nome: "Mouse Logitech",
      descricao: "Mouse sem fio ergonômico",
      quantidade: 12,
      imagem: "/next.svg",
    },
  ]);

  return (
    <VerticalBar>
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Produtos</h1>

        <div className="flex gap-4">

          {/* Botões de visualização */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-4 py-2 ${view === "grid" ? "bg-gray-900 text-white" : "bg-white"}`}
            >
              Grid
            </button>

            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 ${view === "list" ? "bg-gray-900 text-white" : "bg-white"}`}
            >
              Lista
            </button>
          </div>

          {/* Adicionar produto */}
          <button className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition">
            + Adicionar Produto
          </button>

        </div>
      </div>

      {/* GRID */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
            >

              <div className="relative w-full h-40">
                <Image
                  src={produto.imagem}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{produto.nome}</h2>

                <p className="text-gray-600 mb-4">{produto.descricao}</p>

                <div className="text-sm text-gray-500">
                  Quantidade: <span className="font-medium">{produto.quantidade}</span>
                </div>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* LISTA */}
      {view === "list" && (
        <div className="flex flex-col gap-4">

          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="flex items-center gap-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >

              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={produto.imagem}
                  alt={produto.nome}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-lg">{produto.nome}</h2>
                <p className="text-gray-600 text-sm">{produto.descricao}</p>
              </div>

              <div className="text-sm font-medium text-gray-700">
                Estoque: {produto.quantidade}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
    </VerticalBar>
  );
}