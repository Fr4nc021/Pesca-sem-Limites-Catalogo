"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient";

const CATEGORIAS = [
  { id: "pistola", label: "Pistola" },
  { id: "revolver", label: "Revolver" },
  { id: "espingarda-semiauto", label: "Espingarda SemiAuto" },
  { id: "espingarda-repeticao", label: "Espingarda de repetição" },
  { id: "carabina", label: "Carabina" },
  { id: "fuzil", label: "Fuzil" },
];

type Marca = { id: string; nome: string };
type Calibre = { id: string; nome: string };
type Funcionamento = { id: string; nome: string };

type FormArma = {
  categoria: string;
  nome: string;
  preco: string;
  calibre_id: string;
  funcionamento_id: string;
  espec_capacidade_tiros: string;
  espec_carregadores: string;
  marca_id: string;
  espec_comprimento_cano: string;
  caracteristica_acabamento: string;
};

const initialForm: FormArma = {
  categoria: "",
  nome: "",
  preco: "",
  calibre_id: "",
  funcionamento_id: "",
  espec_capacidade_tiros: "",
  espec_carregadores: "",
  marca_id: "",
  espec_comprimento_cano: "",
  caracteristica_acabamento: "",
};

const inputClass =
  "w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-[#E9B20E] focus:outline-none focus:ring-1 focus:ring-[#E9B20E]";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

export default function CadastrosPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [calibres, setCalibres] = useState<Calibre[]>([]);
  const [funcionamentos, setFuncionamentos] = useState<Funcionamento[]>([]);
  const [form, setForm] = useState<FormArma>(initialForm);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authLoading) return;

    const fetchMarcas = async () => {
      const { data } = await supabase
        .from("marcas")
        .select("id, nome")
        .order("nome");
      if (data) setMarcas(data);
    };

    const fetchCalibres = async () => {
      const { data } = await supabase
        .from("calibres")
        .select("id, nome")
        .order("nome");
      if (data) setCalibres(data);
    };

    const fetchFuncionamentos = async () => {
      const { data } = await supabase
        .from("funcionamento")
        .select("id, nome")
        .order("nome");
      if (data) setFuncionamentos(data);
    };

    fetchMarcas();
    fetchCalibres();
    fetchFuncionamentos();
  }, [authLoading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFotoFile(file);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      // 1. Cadastra a arma sem foto para obter o ID
      const { data: insertData, error: insertError } = await supabase
        .from("armas")
        .insert([
          {
            categoria: form.categoria || null,
            nome: form.nome || null,
            preco: form.preco
              ? parseFloat(form.preco.replace(",", "."))
              : null,
            funcionamento_id: form.funcionamento_id || null,
            espec_capacidade_tiros: form.espec_capacidade_tiros || null,
            espec_carregadores: form.espec_carregadores || null,
            marca_id: form.marca_id || null,
            espec_comprimento_cano: form.espec_comprimento_cano || null,
            caracteristica_acabamento:
              form.caracteristica_acabamento || null,
          },
        ])
        .select("id")
        .single();

      if (insertError || !insertData) {
        throw insertError || new Error("Erro ao cadastrar arma");
      }

      const armaId = insertData.id as string;

      // 2. Se tiver foto, envia para o Storage e atualiza a arma com a URL
      if (fotoFile) {
        const fileExt = fotoFile.name.split(".").pop();
        const filePath = `armas/${armaId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos-armas")
          .upload(filePath, fotoFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error(uploadError);
          throw new Error("Erro ao fazer upload da foto");
        }

        const { data: publicUrlData } = supabase.storage
          .from("fotos-armas")
          .getPublicUrl(filePath);

        const fotoUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
          .from("armas")
          .update({ foto_url: fotoUrl })
          .eq("id", armaId);

        if (updateError) {
          console.error(updateError);
          throw new Error("Erro ao salvar URL da foto na arma");
        }
      }

      setMessage({ type: "ok", text: "Arma cadastrada com sucesso." });
      setForm(initialForm);
      setFotoFile(null);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Erro ao cadastrar arma",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

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
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#030711" }}
    >
      <Header />

      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-medium transition-colors"
            style={{
              borderColor: "#E9B20E",
              color: "#E9B20E",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(233, 178, 14, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar
          </button>

          <h1 className="mb-8 text-3xl font-bold text-white md:text-4xl">
            Cadastro de arma
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados gerais */}
            <section className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Dados gerais
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoria" className={labelClass}>
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="nome" className={labelClass}>
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={form.nome}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nome da arma"
                  />
                </div>
                <div>
                  <label htmlFor="foto" className={labelClass}>
                    Foto da arma
                  </label>
                  <input
                    id="foto"
                    name="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="preco" className={labelClass}>
                    Preço (R$)
                  </label>
                  <input
                    id="preco"
                    name="preco"
                    type="text"
                    value={form.preco}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </section>

            {/* Especificações */}
            <section className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Especificações
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="calibres_id" className={labelClass}>
                    Calibre
                  </label>
                  <select
                    id="calibre_id"
                    name="calibre_id"
                    value={form.calibre_id}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {calibres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="funcionamento_id"
                    className={labelClass}
                  >
                    Tipo de funcionamento
                  </label>
                  <select
                    id="funcionamento_id"
                    name="funcionamento_id"
                    value={form.funcionamento_id}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {funcionamentos.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="espec_capacidade_tiros"
                    className={labelClass}
                  >
                    Capacidade de tiros
                  </label>
                  <input
                    id="espec_capacidade_tiros"
                    name="espec_capacidade_tiros"
                    type="text"
                    value={form.espec_capacidade_tiros}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ex.: 15+1"
                  />
                </div>
                <div>
                  <label htmlFor="espec_carregadores" className={labelClass}>
                    Carregadores
                  </label>
                  <input
                    id="espec_carregadores"
                    name="espec_carregadores"
                    type="text"
                    value={form.espec_carregadores}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ex.: 2"
                  />
                </div>
                <div>
                  <label htmlFor="marca_id" className={labelClass}>
                    Marca da arma
                  </label>
                  <select
                    id="marca_id"
                    name="marca_id"
                    value={form.marca_id}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="espec_comprimento_cano"
                    className={labelClass}
                  >
                    Comprimento do cano
                  </label>
                  <input
                    id="espec_comprimento_cano"
                    name="espec_comprimento_cano"
                    type="text"
                    value={form.espec_comprimento_cano}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ex.: 4 pol."
                  />
                </div>
                <div>
                  <label
                    htmlFor="caracteristica_acabamento"
                    className={labelClass}
                  >
                    Acabamento
                  </label>
                  <input
                    id="caracteristica_acabamento"
                    name="caracteristica_acabamento"
                    type="text"
                    value={form.caracteristica_acabamento}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ex.: fosco, cromado"
                  />
                </div>
              </div>
            </section>

            {message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  message.type === "ok"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full rounded-lg px-6 py-3.5 text-base font-bold text-zinc-900 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#E9B20E" }}
              onMouseEnter={(e) => {
                if (!submitLoading)
                  e.currentTarget.style.backgroundColor = "#D4A00D";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E9B20E";
              }}
            >
              {submitLoading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
