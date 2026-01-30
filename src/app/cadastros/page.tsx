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

type FotoArma = {
  id: string;
  foto_url: string;
  ordem: number;
};

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
  em_destaque: boolean | null;
  marca?: { nome: string } | null;
  calibre?: { nome: string } | null;
  funcionamento?: { nome: string } | null;
  categoria?: { nome: string } | null;
  fotos?: FotoArma[];
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
  em_destaque: boolean;
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
  em_destaque: false,
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
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<FotoArma[]>([]);
  const [fotosParaRemover, setFotosParaRemover] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filtroMarca, setFiltroMarca] = useState<string>("");
  const [filtroCalibre, setFiltroCalibre] = useState<string>("");
  const [filtroNome, setFiltroNome] = useState<string>("");

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

      // Buscar todas as fotos das armas
      const armaIds = (armasData || []).map((a: any) => a.id);
      
      let fotosMap = new Map<string, FotoArma[]>();
      
      // Só buscar fotos se houver armas e se a tabela existir
      if (armaIds.length > 0) {
        const { data: fotosData, error: fotosError } = await supabase
          .from("fotos_armas")
          .select("*")
          .in("arma_id", armaIds)
          .order("ordem");

        // Se a tabela não existir, apenas logar o erro mas continuar
        if (fotosError) {
          console.warn("Erro ao buscar fotos (tabela pode não existir ainda):", fotosError);
          // Continuar sem fotos se a tabela não existir
        } else if (fotosData) {
          fotosData.forEach((foto: any) => {
            if (!fotosMap.has(foto.arma_id)) {
              fotosMap.set(foto.arma_id, []);
            }
            fotosMap.get(foto.arma_id)!.push({
              id: foto.id,
              foto_url: foto.foto_url,
              ordem: foto.ordem,
            });
          });
        }
      }

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
          fotos: fotosMap.get(arma.id) || [],
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
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
    setMessage(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      setFotoFiles(files);
      
      // Criar previews das imagens
      const previews = files.map(file => URL.createObjectURL(file));
      setFotoPreviews(previews);
    }
    
    setMessage(null);
  };

  const removeFoto = (index: number) => {
    const newFiles = fotoFiles.filter((_, i) => i !== index);
    const newPreviews = fotoPreviews.filter((_, i) => i !== index);
    
    // Revogar URL do preview removido
    URL.revokeObjectURL(fotoPreviews[index]);
    
    setFotoFiles(newFiles);
    setFotoPreviews(newPreviews);
  };

  const removeFotoExistente = (fotoId: string) => {
    setFotosParaRemover([...fotosParaRemover, fotoId]);
    setFotosExistentes(fotosExistentes.filter(f => f.id !== fotoId));
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
      em_destaque: arma.em_destaque || false,
    });
    setFotoFiles([]);
    setFotoPreviews([]);
    setFotosExistentes(arma.fotos || []);
    setFotosParaRemover([]);
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setFotoFiles([]);
    setFotoPreviews([]);
    setFotosExistentes([]);
    setFotosParaRemover([]);
    setShowModal(true);
  };

  const closeModal = () => {
    // Limpar previews ao fechar modal
    fotoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setFotoFiles([]);
    setFotoPreviews([]);
    setFotosExistentes([]);
    setFotosParaRemover([]);
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
          em_destaque: form.em_destaque || false,
        };

        const { error: updateError } = await supabase
          .from("armas")
          .update(updateData)
          .eq("id", editingId);

        if (updateError) throw updateError;

        // Remover fotos marcadas para remoção
        if (fotosParaRemover.length > 0) {
          try {
            // Buscar URLs das fotos para deletar do storage
            const { data: fotosParaDeletar, error: fetchError } = await supabase
              .from("fotos_armas")
              .select("foto_url")
              .in("id", fotosParaRemover);

            // Deletar do storage
            if (!fetchError && fotosParaDeletar) {
              const pathsToDelete = fotosParaDeletar.map((foto: any) => {
                if (foto.foto_url && foto.foto_url.includes("/fotos-armas/")) {
                  const pathIndex = foto.foto_url.indexOf("/fotos-armas/") + "/fotos-armas/".length;
                  return foto.foto_url.substring(pathIndex);
                }
                return null;
              }).filter(Boolean);

              if (pathsToDelete.length > 0) {
                await supabase.storage
                  .from("fotos-armas")
                  .remove(pathsToDelete);
              }
            }

            // Deletar do banco
            const { error: deleteFotosError } = await supabase
              .from("fotos_armas")
              .delete()
              .in("id", fotosParaRemover);

            if (deleteFotosError) {
              console.warn("Erro ao remover fotos do banco:", deleteFotosError);
              // Não falhar se a tabela não existir
              if (deleteFotosError.code !== "PGRST116" && deleteFotosError.code !== "42P01") {
                throw new Error("Erro ao remover fotos");
              }
            }
          } catch (err: any) {
            console.warn("Erro ao remover fotos (tabela pode não existir):", err);
            // Continuar mesmo se não conseguir remover
          }
        }

        // Fazer upload de novas fotos
        if (fotoFiles.length > 0) {
          // Buscar a maior ordem atual para continuar a numeração
          let ordemInicial = 0;
          
          try {
            const { data: fotosAtuais, error: fotosError } = await supabase
              .from("fotos_armas")
              .select("ordem")
              .eq("arma_id", editingId)
              .order("ordem", { ascending: false })
              .limit(1);

            if (!fotosError && fotosAtuais && fotosAtuais.length > 0) {
              ordemInicial = (fotosAtuais[0] as any).ordem + 1;
            }
          } catch (err) {
            console.warn("Erro ao buscar ordem das fotos (tabela pode não existir):", err);
            ordemInicial = 0;
          }

          const uploadPromises = fotoFiles.map(async (file, index) => {
            const fileExt = file.name.split(".").pop();
            const filePath = `armas/${editingId}-${Date.now()}-${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("fotos-armas")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
              });

            if (uploadError) {
              console.error("Erro no upload:", uploadError);
              throw new Error(`Erro ao fazer upload da foto ${index + 1}: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
              .from("fotos-armas")
              .getPublicUrl(filePath);

            console.log("URL pública gerada:", publicUrlData.publicUrl);
            console.log("Inserindo foto na tabela fotos_armas:", {
              arma_id: editingId,
              foto_url: publicUrlData.publicUrl,
              ordem: ordemInicial + index,
            });

            // Inserir na tabela fotos_armas
            const { data: insertedFoto, error: insertFotoError } = await supabase
              .from("fotos_armas")
              .insert({
                arma_id: editingId,
                foto_url: publicUrlData.publicUrl,
                ordem: ordemInicial + index,
              })
              .select();

            if (insertFotoError) {
              console.error("Erro ao inserir foto:", insertFotoError);
              console.error("Detalhes do erro:", {
                code: insertFotoError.code,
                message: insertFotoError.message,
                details: insertFotoError.details,
                hint: insertFotoError.hint,
              });
              throw new Error(`Erro ao salvar URL da foto ${index + 1}: ${insertFotoError.message || insertFotoError.code || "Erro desconhecido"}`);
            }

            console.log("Foto inserida com sucesso:", insertedFoto);
          });

          await Promise.all(uploadPromises);
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
              em_destaque: form.em_destaque || false,
            },
          ])
          .select("id")
          .single();

        if (insertError || !insertData) {
          throw insertError || new Error("Erro ao cadastrar arma");
        }

        const armaId = insertData.id as string;

        // Fazer upload de todas as fotos
        if (fotoFiles.length > 0) {
          const uploadPromises = fotoFiles.map(async (file, index) => {
            const fileExt = file.name.split(".").pop();
            const filePath = `armas/${armaId}-${Date.now()}-${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("fotos-armas")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
              });

            if (uploadError) {
              console.error("Erro no upload:", uploadError);
              throw new Error(`Erro ao fazer upload da foto ${index + 1}: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
              .from("fotos-armas")
              .getPublicUrl(filePath);

            console.log("URL pública gerada:", publicUrlData.publicUrl);
            console.log("Inserindo foto na tabela fotos_armas:", {
              arma_id: armaId,
              foto_url: publicUrlData.publicUrl,
              ordem: index,
            });

            // Inserir na tabela fotos_armas
            const { data: insertedFoto, error: insertFotoError } = await supabase
              .from("fotos_armas")
              .insert({
                arma_id: armaId,
                foto_url: publicUrlData.publicUrl,
                ordem: index,
              })
              .select();

            if (insertFotoError) {
              console.error("Erro ao inserir foto:", insertFotoError);
              console.error("Detalhes do erro:", {
                code: insertFotoError.code,
                message: insertFotoError.message,
                details: insertFotoError.details,
                hint: insertFotoError.hint,
              });
              throw new Error(`Erro ao salvar URL da foto ${index + 1}: ${insertFotoError.message || insertFotoError.code || "Erro desconhecido"}`);
            }

            console.log("Foto inserida com sucesso:", insertedFoto);
          });

          await Promise.all(uploadPromises);
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

  // Filtrar armas baseado nos filtros
  const armasFiltradas = armas.filter((arma) => {
    const matchMarca = !filtroMarca || arma.marca_id === filtroMarca;
    const matchCalibre = !filtroCalibre || arma.calibres_id === filtroCalibre;
    const matchNome = !filtroNome || (arma.nome || "").toLowerCase().includes(filtroNome.toLowerCase());
    return matchMarca && matchCalibre && matchNome;
  });

  const limparFiltros = () => {
    setFiltroMarca("");
    setFiltroCalibre("");
    setFiltroNome("");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Buscar todas as fotos da arma
      try {
        const { data: fotosData, error: fotosError } = await supabase
          .from("fotos_armas")
          .select("foto_url")
          .eq("arma_id", id);

        // Deletar fotos do storage
        if (!fotosError && fotosData && fotosData.length > 0) {
          try {
            const pathsToDelete = fotosData.map((foto: any) => {
              if (foto.foto_url && foto.foto_url.includes("/fotos-armas/")) {
                const pathIndex = foto.foto_url.indexOf("/fotos-armas/") + "/fotos-armas/".length;
                return foto.foto_url.substring(pathIndex);
              }
              return null;
            }).filter(Boolean);

            if (pathsToDelete.length > 0) {
              const { error: storageError } = await supabase.storage
                .from("fotos-armas")
                .remove(pathsToDelete);

              // Não falhar se não conseguir deletar as fotos (pode já ter sido deletadas)
              if (storageError) {
                console.warn("Erro ao deletar fotos do storage:", storageError);
              }
            }
          } catch (storageErr) {
            console.warn("Erro ao deletar fotos:", storageErr);
            // Continuar mesmo se não conseguir deletar as fotos
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar fotos para deletar (tabela pode não existir):", err);
        // Continuar mesmo se não conseguir buscar fotos
      }

      // Deletar a arma do banco de dados (o CASCADE vai deletar as fotos automaticamente)
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

          {/* Filtros */}
          <div className="mb-6 rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Filtros</h2>
              {(filtroMarca || filtroCalibre || filtroNome) && (
                <button
                  onClick={limparFiltros}
                  className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="filtro-nome" className={labelClass}>
                  Nome
                </label>
                <input
                  id="filtro-nome"
                  type="text"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className={inputClass}
                  placeholder="Buscar por nome..."
                />
              </div>
              <div>
                <label htmlFor="filtro-marca" className={labelClass}>
                  Marca
                </label>
                <select
                  id="filtro-marca"
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Todas as marcas</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filtro-calibre" className={labelClass}>
                  Calibre
                </label>
                <select
                  id="filtro-calibre"
                  value={filtroCalibre}
                  onChange={(e) => setFiltroCalibre(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Todos os calibres</option>
                  {calibres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(filtroMarca || filtroCalibre || filtroNome) && (
              <div className="mt-3 text-sm text-zinc-400">
                Mostrando {armasFiltradas.length} de {armas.length} armas
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center text-white">Carregando...</div>
          ) : armas.length === 0 ? (
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-8 text-center">
              <p className="text-zinc-400">Nenhuma arma cadastrada ainda.</p>
            </div>
          ) : armasFiltradas.length === 0 ? (
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-8 text-center">
              <p className="text-zinc-400">Nenhuma arma encontrada com os filtros aplicados.</p>
              <button
                onClick={limparFiltros}
                className="mt-4 text-[#E9B20E] hover:underline"
              >
                Limpar filtros
              </button>
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
                      Destaque
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {armasFiltradas.map((arma) => (
                    <tr
                      key={arma.id}
                      className="border-b border-zinc-700/30 transition-colors hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3">
                        {arma.fotos && arma.fotos.length > 0 ? (
                          <div className="flex gap-1">
                            {arma.fotos.slice(0, 3).map((foto) => (
                              <img
                                key={foto.id}
                                src={foto.foto_url}
                                alt={arma.nome || ""}
                                className="h-16 w-16 rounded object-cover"
                              />
                            ))}
                            {arma.fotos.length > 3 && (
                              <div className="flex h-16 w-16 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                                +{arma.fotos.length - 3}
                              </div>
                            )}
                          </div>
                        ) : arma.foto_url ? (
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
                        <div className="flex items-center justify-center">
                          {arma.em_destaque ? (
                            <span
                              className="rounded-full px-2 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: "rgba(233, 178, 14, 0.2)",
                                color: "#E9B20E",
                              }}
                            >
                              ★ Destaque
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-500">-</span>
                          )}
                        </div>
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
                      Fotos da arma {editingId && "(adicione novas fotos)"}
                    </label>
                    <input
                      id="foto"
                      name="foto"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFotoChange}
                      className={inputClass}
                    />
                    
                    {/* Fotos existentes (apenas na edição) */}
                    {editingId && fotosExistentes.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm text-zinc-400">Fotos existentes:</p>
                        <div className="grid grid-cols-3 gap-4">
                          {fotosExistentes.map((foto) => (
                            <div key={foto.id} className="relative">
                              <img
                                src={foto.foto_url}
                                alt={`Foto ${foto.ordem + 1}`}
                                className="h-24 w-full rounded object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeFotoExistente(foto.id)}
                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Preview das fotos selecionadas */}
                    {fotoPreviews.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm text-zinc-400">Novas fotos selecionadas:</p>
                        <div className="grid grid-cols-3 gap-4">
                          {fotoPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-full rounded object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeFoto(index)}
                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <div className="flex items-center gap-3">
                    <input
                      id="em_destaque"
                      name="em_destaque"
                      type="checkbox"
                      checked={form.em_destaque}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-zinc-600 bg-zinc-800/50 text-[#E9B20E] focus:ring-1 focus:ring-[#E9B20E]"
                    />
                    <label htmlFor="em_destaque" className="text-sm font-medium text-zinc-300 cursor-pointer">
                      Marcar como destaque
                    </label>
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
