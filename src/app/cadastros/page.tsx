"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

type Marca = { id: string; nome: string };
type Calibre = { id: string; nome: string };
type Funcionamento = { id: string; nome: string };
type Categoria = { id: number; nome: string };

type Arma = {
  id: string;
  categoria_id: number | null;
  nome: string | null;
  preco: number | null;
  calibres_id: string | null;
  funcionamento_id: string | null;
  espec_capacidade_tiros: string | null;
  espec_carregadores: string | null;
  marca_id: string | null;
  espec_comprimento_cano: string | null;
  caracteristica_acabamento: string | null;
  foto_url: string | null;
  marca?: { nome: string } | null;
  calibre?: { nome: string } | null;
  funcionamento?: { nome: string } | null;
  categoria?: { nome: string } | null;
};

type FormArma = {
  categoria_id: string;
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
  categoria_id: "",
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
  const { authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [calibres, setCalibres] = useState<Calibre[]>([]);
  const [funcionamentos, setFuncionamentos] = useState<Funcionamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [armas, setArmas] = useState<Arma[]>([]);
  const [form, setForm] = useState<FormArma>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const fetchCategorias = async () => {
      const { data } = await supabase
        .from("categorias")
        .select("id, nome")
        .order("nome");
      if (data) setCategorias(data);
    };

    fetchMarcas();
    fetchCalibres();
    fetchFuncionamentos();
    fetchCategorias();
    fetchArmas();
  }, [authLoading]);

  const fetchArmas = async () => {
    setLoading(true);
    try {
      const { data: armasData, error } = await supabase
        .from("armas")
        .select("*")
        .order("nome");

      if (error) throw error;

      // Buscar dados relacionados
      const marcaIds = [...new Set((armasData || []).map((a: any) => a.marca_id).filter(Boolean))];
      const calibreIds = [...new Set((armasData || []).map((a: any) => a.calibre_id || a.calibres_id).filter(Boolean))];
      const funcionamentoIds = [...new Set((armasData || []).map((a: any) => a.funcionamento_id).filter(Boolean))];
      const categoriaIds = [...new Set((armasData || []).map((a: any) => a.categoria_id).filter(Boolean))];

      const [marcasResult, calibresResult, funcionamentosResult, categoriasResult] = await Promise.all([
        marcaIds.length > 0
          ? supabase.from("marcas").select("id, nome").in("id", marcaIds)
          : { data: [], error: null },
        calibreIds.length > 0
          ? supabase.from("calibres").select("id, nome").in("id", calibreIds)
          : { data: [], error: null },
        funcionamentoIds.length > 0
          ? supabase.from("funcionamento").select("id, nome").in("id", funcionamentoIds)
          : { data: [], error: null },
        categoriaIds.length > 0
          ? supabase.from("categorias").select("id, nome").in("id", categoriaIds)
          : { data: [], error: null },
      ]);

      const marcasMap = new Map((marcasResult.data || []).map((m: any) => [m.id, m.nome]));
      const calibresMap = new Map((calibresResult.data || []).map((c: any) => [c.id, c.nome]));
      const funcionamentosMap = new Map((funcionamentosResult.data || []).map((f: any) => [f.id, f.nome]));
      const categoriasMap = new Map((categoriasResult.data || []).map((c: any) => [c.id, c.nome]));

      const armasFormatadas = (armasData || []).map((arma: any) => {
        const calibreId = arma.calibre_id || arma.calibres_id;
        return {
          ...arma,
          marca: arma.marca_id && marcasMap.has(arma.marca_id) ? { nome: marcasMap.get(arma.marca_id) } : null,
          calibre: calibreId && calibresMap.has(calibreId) ? { nome: calibresMap.get(calibreId) } : null,
          funcionamento: arma.funcionamento_id && funcionamentosMap.has(arma.funcionamento_id) ? { nome: funcionamentosMap.get(arma.funcionamento_id) } : null,
          categoria: arma.categoria_id && categoriasMap.has(arma.categoria_id) ? { nome: categoriasMap.get(arma.categoria_id) } : null,
        };
      });

      setArmas(armasFormatadas);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Erro ao carregar armas",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const openEditModal = (arma: Arma) => {
    setEditingId(arma.id);
    setForm({
      categoria_id: arma.categoria_id?.toString() || "",
      nome: arma.nome || "",
      preco: arma.preco?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "",
      calibre_id: arma.calibres_id || "",
      funcionamento_id: arma.funcionamento_id || "",
      espec_capacidade_tiros: arma.espec_capacidade_tiros || "",
      espec_carregadores: arma.espec_carregadores || "",
      marca_id: arma.marca_id || "",
      espec_comprimento_cano: arma.espec_comprimento_cano || "",
      caracteristica_acabamento: arma.caracteristica_acabamento || "",
    });
    setFotoFile(null);
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setFotoFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setFotoFile(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      const precoValue = form.preco
        ? parseFloat(form.preco.replace(/\./g, "").replace(",", "."))
        : null;

      if (editingId) {
        // Editar arma existente
        const updateData: any = {
          categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
          nome: form.nome || null,
          preco: precoValue,
          funcionamento_id: form.funcionamento_id || null,
          espec_capacidade_tiros: form.espec_capacidade_tiros || null,
          espec_carregadores: form.espec_carregadores || null,
          marca_id: form.marca_id || null,
          calibres_id: form.calibre_id || null,
          espec_comprimento_cano: form.espec_comprimento_cano || null,
          caracteristica_acabamento: form.caracteristica_acabamento || null,
        };

        const { error: updateError } = await supabase
          .from("armas")
          .update(updateData)
          .eq("id", editingId);

        if (updateError) throw updateError;

        // Se tiver nova foto, fazer upload
        if (fotoFile) {
          const fileExt = fotoFile.name.split(".").pop();
          const filePath = `armas/${editingId}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("fotos-armas")
            .upload(filePath, fotoFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) throw new Error("Erro ao fazer upload da foto");

          const { data: publicUrlData } = supabase.storage
            .from("fotos-armas")
            .getPublicUrl(filePath);

          const { error: updateFotoError } = await supabase
            .from("armas")
            .update({ foto_url: publicUrlData.publicUrl })
            .eq("id", editingId);

          if (updateFotoError) throw new Error("Erro ao salvar URL da foto");
        }

        setMessage({ type: "ok", text: "Arma atualizada com sucesso." });
      } else {
        // Criar nova arma
        const { data: insertData, error: insertError } = await supabase
          .from("armas")
          .insert([
            {
              categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
              nome: form.nome || null,
              preco: precoValue,
              funcionamento_id: form.funcionamento_id || null,
              espec_capacidade_tiros: form.espec_capacidade_tiros || null,
              espec_carregadores: form.espec_carregadores || null,
              marca_id: form.marca_id || null,
              calibres_id: form.calibre_id || null,
              espec_comprimento_cano: form.espec_comprimento_cano || null,
              caracteristica_acabamento: form.caracteristica_acabamento || null,
            },
          ])
          .select("id")
          .single();

        if (insertError || !insertData) {
          throw insertError || new Error("Erro ao cadastrar arma");
        }

        const armaId = insertData.id as string;

        if (fotoFile) {
          const fileExt = fotoFile.name.split(".").pop();
          const filePath = `armas/${armaId}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("fotos-armas")
            .upload(filePath, fotoFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) throw new Error("Erro ao fazer upload da foto");

          const { data: publicUrlData } = supabase.storage
            .from("fotos-armas")
            .getPublicUrl(filePath);

          const { error: updateError } = await supabase
            .from("armas")
            .update({ foto_url: publicUrlData.publicUrl })
            .eq("id", armaId);

          if (updateError) throw new Error("Erro ao salvar URL da foto");
        }

        setMessage({ type: "ok", text: "Arma cadastrada com sucesso." });
      }

      // Recarregar lista e fechar modal após 1 segundo
      await fetchArmas();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Erro ao salvar arma",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Primeiro, buscar a arma para pegar a URL da foto
      const { data: armaData, error: fetchError } = await supabase
        .from("armas")
        .select("foto_url")
        .eq("id", id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Se tiver foto, tentar deletar do storage
      if (armaData?.foto_url) {
        try {
          // Extrair o caminho do arquivo da URL do Supabase Storage
          // A URL geralmente tem o formato: https://[project].supabase.co/storage/v1/object/public/fotos-armas/armas/[filename]
          let filePath = "";
          if (armaData.foto_url.includes("/fotos-armas/")) {
            // Extrair tudo após /fotos-armas/
            const pathIndex = armaData.foto_url.indexOf("/fotos-armas/") + "/fotos-armas/".length;
            filePath = armaData.foto_url.substring(pathIndex);
          } else {
            // Fallback: tentar extrair o nome do arquivo e assumir que está em "armas/"
            const urlParts = armaData.foto_url.split("/");
            const fileName = urlParts[urlParts.length - 1];
            filePath = `armas/${fileName}`;
          }

          // Tentar deletar a foto do storage
          const { error: storageError } = await supabase.storage
            .from("fotos-armas")
            .remove([filePath]);

          // Não falhar se não conseguir deletar a foto (pode já ter sido deletada)
          if (storageError) {
            console.warn("Erro ao deletar foto do storage:", storageError);
          }
        } catch (storageErr) {
          console.warn("Erro ao deletar foto:", storageErr);
          // Continuar mesmo se não conseguir deletar a foto
        }
      }

      // Deletar a arma do banco de dados
      const { error: deleteError } = await supabase
        .from("armas")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setMessage({ type: "ok", text: "Arma excluída com sucesso." });
      setDeleteConfirm(null);
      setDeletingId(null);
      await fetchArmas();
    } catch (err: any) {
      console.error("Erro ao excluir arma:", err);
      setMessage({
        type: "error",
        text: err?.message || "Erro ao excluir arma. Verifique o console para mais detalhes.",
      });
      setDeletingId(null);
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
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Gerenciar Cadastros
            </h1>
            <button
              type="button"
              onClick={openNewModal}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-zinc-900 transition-colors"
              style={{ backgroundColor: "#E9B20E" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4A00D";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E9B20E";
              }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Cadastro
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                message.type === "ok"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center text-white">Carregando...</div>
          ) : armas.length === 0 ? (
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-8 text-center">
              <p className="text-zinc-400">Nenhuma arma cadastrada ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg border border-zinc-700/50 bg-zinc-900/30">
                <thead>
                  <tr className="border-b border-zinc-700/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                      Foto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                      Marca
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                      Calibre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                      Preço
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {armas.map((arma) => (
                    <tr
                      key={arma.id}
                      className="border-b border-zinc-700/30 transition-colors hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3">
                        {arma.foto_url ? (
                          <img
                            src={arma.foto_url}
                            alt={arma.nome || ""}
                            className="h-16 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                            Sem foto
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white">{arma.nome || "-"}</td>
                      <td className="px-4 py-3 text-zinc-300">
                        {arma.categoria?.nome || "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {arma.marca?.nome || "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {arma.calibre?.nome || "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {arma.preco
                          ? `R$ ${arma.preco.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(arma)}
                            className="rounded-lg p-2 text-[#E9B20E] transition-colors hover:bg-zinc-800"
                            title="Editar"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(arma.id)}
                            className="rounded-lg p-2 text-red-400 transition-colors hover:bg-zinc-800"
                            title="Excluir"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? "Editar Arma" : "Nova Arma"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados gerais */}
              <section className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Dados gerais
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="categoria_id" className={labelClass}>
                      Categoria
                    </label>
                    <select
                      id="categoria_id"
                      name="categoria_id"
                      value={form.categoria_id}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
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
                      Foto da arma {editingId && "(deixe em branco para manter a atual)"}
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
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Especificações
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="calibre_id" className={labelClass}>
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
                    <label htmlFor="funcionamento_id" className={labelClass}>
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
                    <label htmlFor="espec_capacidade_tiros" className={labelClass}>
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
                    <label htmlFor="espec_comprimento_cano" className={labelClass}>
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
                    <label htmlFor="caracteristica_acabamento" className={labelClass}>
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border-2 px-6 py-3 font-medium transition-colors"
                  style={{
                    borderColor: "#E9B20E",
                    color: "#E9B20E",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 rounded-lg px-6 py-3 text-base font-bold text-zinc-900 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "#E9B20E" }}
                >
                  {submitLoading
                    ? editingId
                      ? "Salvando..."
                      : "Cadastrando..."
                    : editingId
                    ? "Salvar"
                    : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="relative w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-bold text-white">
              Confirmar Exclusão
            </h3>
            <p className="mb-6 text-zinc-300">
              Tem certeza que deseja excluir esta arma? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border-2 px-4 py-2 font-medium transition-colors"
                style={{
                  borderColor: "#E9B20E",
                  color: "#E9B20E",
                  backgroundColor: "transparent",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deletingId === deleteConfirm}
                className="flex-1 rounded-lg px-4 py-2 font-bold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#dc2626" }}
                onMouseEnter={(e) => {
                  if (deletingId !== deleteConfirm) {
                    e.currentTarget.style.backgroundColor = "#b91c1c";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
              >
                {deletingId === deleteConfirm ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
