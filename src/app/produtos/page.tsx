"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

type Arma = {
  id: string;
  nome: string | null;
  preco: number | null;
  foto_url: string | null;
};

export default function ProdutosPage() {
  const router = useRouter();
  const { authLoading } = useAuth();
  const [armas, setArmas] = useState<Arma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchArmas = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("armas")
          .select("id, nome, preco, foto_url")
          .order("nome");

        if (fetchError) {
          setError(`Erro ao carregar produtos: ${fetchError.message}`);
          return;
        }

        setArmas(data || []);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchArmas();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#030711" }}
      >
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#030711" }}
      >
        <Header />
        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-red-400">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#030711" }}
    >
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Catálogo de Armas
          </h1>

          {armas.length === 0 ? (
            <p className="text-zinc-300">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {armas.map((arma) => (
                <div
                  key={arma.id}
                  className="group cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 text-white transition-all hover:border-zinc-600"
                  onClick={() => router.push(`/produto/${arma.id}`)}
                >
                  {arma.foto_url && (
                    <div className="mb-3 h-48 w-full overflow-hidden rounded">
                      <img
                        src={arma.foto_url}
                        alt={arma.nome || "Produto"}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}

                  <h2 className="mb-2 text-lg font-semibold text-white">
                    {arma.nome || "Sem nome"}
                  </h2>

                  {arma.preco != null && (
                    <p className="font-bold text-[#E9B20E]">
                      R$ {parseFloat(arma.preco.toString()).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
