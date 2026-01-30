"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { supabase } from "../../../src/lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const router = useRouter();
  const { authLoading } = useAuth();

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#030711" }}
      >
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#030711" }}>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 text-center">
        {/* Premium Badge */}
        <div
          className="flex items-center gap-2 rounded-full border bg-zinc-800/50 px-4 py-2"
          style={{ borderColor: "rgba(233, 178, 14, 0.5)" }}
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ color: "#E9B20E" }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: "#E9B20E" }}>
            Catalogo 2026
          </span>
        </div>

        {/* Main Headline */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Excelência em
          </h1>
          <h1
            className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
            style={{ color: "#E9B20E" }}
          >
            Armamento de alta
          </h1>
          <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          qualidade
          </h1>
        </div>

        {/* Descriptive Paragraph */}
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl">
          Descubra nossa coleção exclusiva de armas de fogo com a mais alta
          qualidade, precisão incomparável e design sofisticado.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            className="flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-bold text-black transition-colors"
            style={{ backgroundColor: "#E9B20E" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#D4A00D")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#E9B20E")
            }
          >
            Explorar Catálogo
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      </div>

      {/* Modelos em Destaque Section */}
      <section className="w-full px-4 py-16">
        <div className="container mx-auto flex flex-col items-center gap-6 text-center">
          {/* Destaques Badge */}
          <div
            className="flex items-center justify-center rounded-full border px-4 py-2"
            style={{
              borderColor: "rgba(233, 178, 14, 0.5)",
              backgroundColor: "rgba(15, 23, 42, 0.5)",
            }}
          >
            <span className="text-sm font-medium" style={{ color: "#E9B20E" }}>Destaques</span>
          </div>

          {/* Main Title */}
          <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Modelos em Destaque
          </h2>

          {/* Subtitle */}
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            Conheça os modelos mais procurados da nossa coleção premium
          </p>
        </div>
      </section>
    </div>
  );
}

