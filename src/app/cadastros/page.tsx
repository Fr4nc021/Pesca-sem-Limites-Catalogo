"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";

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

type Variacao = {
  id?: string;
  calibre_id: string;
  comprimento_cano: string;
  preco: string;
  fotoFiles?: File[];
  fotoPreviews?: string[];
  fotosExistentes?: FotoArma[];
  fotosParaRemover?: string[];
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
  const [comVariacao, setComVariacao] = useState(false);
  const [variacoes, setVariacoes] = useState<Variacao[]>([]);
  const [activeTab, setActiveTab] = useState<"armas" | "marcas" | "calibres">(
    "armas"
  );
  // Marcas
  const [novaMarca, setNovaMarca] = useState("");
  const [marcaEditandoId, setMarcaEditandoId] = useState<string | null>(null);
  const [marcaEditandoNome, setMarcaEditandoNome] = useState("");

  // Calibres
  const [novoCalibre, setNovoCalibre] = useState("");
  const [calibreEditandoId, setCalibreEditandoId] = useState<string | null>(null);
  const [calibreEditandoNome, setCalibreEditandoNome] = useState("");

  const fetchMarcas = async () => {
    const { data, error } = await supabase
      .from("marcas")
      .select("id, nome")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    if (data) setMarcas(data);
  };

  const fetchCalibres = async () => {
    const { data, error } = await supabase
      .from("calibres")
      .select("id, nome")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    if (data) setCalibres(data);
  };

  const fetchFuncionamentos = async () => {
    const { data, error } = await supabase
      .from("funcionamento")
      .select("id, nome")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    if (data) setFuncionamentos(data);
  };

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nome")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    if (data) setCategorias(data);
  };

  const handleCriarMarca = async () => {
    if (!novaMarca.trim()) return;

    const { error } = await supabase
      .from("marcas")
      .insert({ nome: novaMarca.trim() });

    if (error) {
      console.error(error);
      return;
    }

    setNovaMarca("");
    await fetchMarcas();
  };

  const handleIniciarEdicaoMarca = (id: string, nome: string) => {
    setMarcaEditandoId(id);
    setMarcaEditandoNome(nome);
  };

  const handleSalvarEdicaoMarca = async () => {
    if (!marcaEditandoId || !marcaEditandoNome.trim()) return;

    const { error } = await supabase
      .from("marcas")
      .update({ nome: marcaEditandoNome.trim() })
      .eq("id", marcaEditandoId);

    if (error) {
      console.error(error);
      return;
    }

    setMarcaEditandoId(null);
    setMarcaEditandoNome("");
    await fetchMarcas();
  };

  const handleExcluirMarca = async (id: string) => {
    const { error } = await supabase.from("marcas").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await fetchMarcas();
  };

  const handleCriarCalibre = async () => {
    if (!novoCalibre.trim()) return;

    const { error } = await supabase
      .from("calibres")
      .insert({ nome: novoCalibre.trim() });

    if (error) {
      console.error(error);
      return;
    }

    setNovoCalibre("");
    await fetchCalibres();
  };

  const handleIniciarEdicaoCalibre = (id: string, nome: string) => {
    setCalibreEditandoId(id);
    setCalibreEditandoNome(nome);
  };

  const handleSalvarEdicaoCalibre = async () => {
    if (!calibreEditandoId || !calibreEditandoNome.trim()) return;

    const { error } = await supabase
      .from("calibres")
      .update({ nome: calibreEditandoNome.trim() })
      .eq("id", calibreEditandoId);

    if (error) {
      console.error(error);
      return;
    }

    setCalibreEditandoId(null);
    setCalibreEditandoNome("");
    await fetchCalibres();
  };

  const handleExcluirCalibre = async (id: string) => {
    const { error } = await supabase.from("calibres").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await fetchCalibres();
  };

  useEffect(() => {
    if (authLoading) return;

    fetchMarcas();
    fetchCalibres();
    fetchFuncionamentos();
    fetchCategorias();
    fetchArmas();
  }, [authLoading]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role !== "admin") {
          router.push("/dashboard");
        }
      }
    };

    if (!authLoading) {
      checkAdminAccess();
    }
  }, [authLoading, router]);

  const fetchArmas = async () => {
    setLoading(true);
    try {
      // Buscar armas e dados relacionados em paralelo
      const [armasResult, fotosResult] = await Promise.all([
        supabase
          .from("armas")
          .select("*")
          .order("nome"),
        // Buscar todas as fotos de uma vez (se houver armas)
        supabase
          .from("fotos_armas")
          .select("id, arma_id, foto_url, ordem")
          .order("arma_id, ordem")
      ]);

      if (armasResult.error) throw armasResult.error;

      const armasData = armasResult.data || [];
      const armaIds = armasData.map((a: any) => a.id);
      
      // Processar fotos
      let fotosMap = new Map<string, FotoArma[]>();
      if (fotosResult.data && armaIds.length > 0) {
        fotosResult.data.forEach((foto: any) => {
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

      // Extrair IDs únicos para buscar relacionamentos
      const marcaIds = [...new Set(armasData.map((a: any) => a.marca_id).filter(Boolean))];
      const calibreIds = [...new Set(armasData.map((a: any) => a.calibre_id || a.calibres_id).filter(Boolean))];
      const funcionamentoIds = [...new Set(armasData.map((a: any) => a.funcionamento_id).filter(Boolean))];
      const categoriaIds = [...new Set(armasData.map((a: any) => a.categoria_id).filter(Boolean))];

      // Buscar todos os relacionamentos em paralelo
      const [marcasResult, calibresResult, funcionamentosResult, categoriasResult] = await Promise.all([
        marcaIds.length > 0
          ? supabase.from("marcas").select("id, nome").in("id", marcaIds)
          : Promise.resolve({ data: [], error: null }),
        calibreIds.length > 0
          ? supabase.from("calibres").select("id, nome").in("id", calibreIds)
          : Promise.resolve({ data: [], error: null }),
        funcionamentoIds.length > 0
          ? supabase.from("funcionamento").select("id, nome").in("id", funcionamentoIds)
          : Promise.resolve({ data: [], error: null }),
        categoriaIds.length > 0
          ? supabase.from("categorias").select("id, nome").in("id", categoriaIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      // Criar maps para lookup rápido
      const marcasMap = new Map((marcasResult.data || []).map((m: any) => [m.id, m.nome]));
      const calibresMap = new Map((calibresResult.data || []).map((c: any) => [c.id, c.nome]));
      const funcionamentosMap = new Map((funcionamentosResult.data || []).map((f: any) => [f.id, f.nome]));
      const categoriasMap = new Map((categoriasResult.data || []).map((c: any) => [c.id, c.nome]));

      // Formatar dados
      const armasFormatadas = armasData.map((arma: any) => {
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

  const addVariacao = () => {
    setVariacoes((prev) => [
      ...prev,
      { calibre_id: "", comprimento_cano: "", preco: "", fotoFiles: [], fotoPreviews: [], fotosExistentes: [], fotosParaRemover: [] },
    ]);
  };

  const removeVariacao = (index: number) => {
    const v = variacoes[index];
    if (v.fotoPreviews) v.fotoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setVariacoes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariacao = (index: number, field: keyof Variacao, value: string | string[] | File[] | FotoArma[]) => {
    setVariacoes((prev) => {
      const next = [...prev];
      const cur = { ...next[index] };
      if (field === "fotoFiles") cur.fotoFiles = value as File[];
      else if (field === "fotoPreviews") cur.fotoPreviews = value as string[];
      else if (field === "fotosExistentes") cur.fotosExistentes = value as FotoArma[];
      else if (field === "fotosParaRemover") cur.fotosParaRemover = value as string[];
      else (cur as any)[field] = value;
      next[index] = cur;
      return next;
    });
  };

  const handleVariacaoFotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setVariacoes((prev) => {
      const next = [...prev];
      const cur = { ...next[index] };
      cur.fotoFiles = [...(cur.fotoFiles || []), ...files];
      cur.fotoPreviews = [...(cur.fotoPreviews || []), ...previews];
      next[index] = cur;
      return next;
    });
  };

  const removeVariacaoFoto = (variacaoIndex: number, fotoIndex: number) => {
    setVariacoes((prev) => {
      const next = [...prev];
      const cur = { ...next[variacaoIndex] };
      const files = cur.fotoFiles || [];
      const previews = cur.fotoPreviews || [];
      if (previews[fotoIndex]) URL.revokeObjectURL(previews[fotoIndex]);
      cur.fotoFiles = files.filter((_, i) => i !== fotoIndex);
      cur.fotoPreviews = previews.filter((_, i) => i !== fotoIndex);
      next[variacaoIndex] = cur;
      return next;
    });
  };

  const removeVariacaoFotoExistente = (variacaoIndex: number, fotoId: string) => {
    setVariacoes((prev) => {
      const next = [...prev];
      const cur = { ...next[variacaoIndex] };
      cur.fotosExistentes = (cur.fotosExistentes || []).filter((f) => f.id !== fotoId);
      cur.fotosParaRemover = [...(cur.fotosParaRemover || []), fotoId];
      next[variacaoIndex] = cur;
      return next;
    });
  };

  const openEditModal = async (arma: Arma) => {
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
    setComVariacao(false);
    setVariacoes([]);

    // Buscar variações e fotos em paralelo
    const [variacoesResult, fotosResult] = await Promise.all([
      supabase
        .from("variacoes_armas")
        .select("id, calibre_id, comprimento_cano, preco")
        .eq("arma_id", arma.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("fotos_armas")
        .select("id, variacao_id, foto_url, ordem")
        .eq("arma_id", arma.id)
        .order("variacao_id, ordem")
    ]);

    const variacoesData = variacoesResult.data || [];
    const fotosData = fotosResult.data || [];

    if (variacoesData.length > 0) {
      setComVariacao(true);
      
      // Criar mapa de fotos por variação
      const fotosPorVariacao = new Map<string, FotoArma[]>();
      fotosData.forEach((foto: any) => {
        if (foto.variacao_id) {
          if (!fotosPorVariacao.has(foto.variacao_id)) {
            fotosPorVariacao.set(foto.variacao_id, []);
          }
          fotosPorVariacao.get(foto.variacao_id)!.push({
            id: foto.id,
            foto_url: foto.foto_url,
            ordem: foto.ordem,
          });
        }
      });

      // Formatar variações com suas fotos
      const variacoesComFotos = variacoesData.map((v: any) => ({
        id: v.id,
        calibre_id: v.calibre_id || "",
        comprimento_cano: v.comprimento_cano || "",
        preco: v.preco != null ? Number(v.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
        fotosExistentes: fotosPorVariacao.get(v.id) || [],
        fotosParaRemover: [] as string[],
      }));
      
      setVariacoes(variacoesComFotos);
    }

    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setFotoFiles([]);
    setFotoPreviews([]);
    setFotosExistentes([]);
    setFotosParaRemover([]);
    setComVariacao(false);
    setVariacoes([]);
    setShowModal(true);
  };

  const closeModal = () => {
    fotoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    variacoes.forEach((v) => {
      (v.fotoPreviews || []).forEach((url) => URL.revokeObjectURL(url));
    });
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setFotoFiles([]);
    setFotoPreviews([]);
    setFotosExistentes([]);
    setFotosParaRemover([]);
    setComVariacao(false);
    setVariacoes([]);
    setMessage(null);
  };

  const parsePreco = (s: string) => {
    if (!s || !s.trim()) return null;
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitLoading(true);

    try {
      // Validação básica
      if (!form.nome || !form.nome.trim()) {
        setMessage({ type: "error", text: "O nome do produto é obrigatório." });
        setSubmitLoading(false);
        return;
      }

      const precoValue = form.preco
        ? parseFloat(form.preco.replace(/\./g, "").replace(",", "."))
        : null;

      if (comVariacao) {
        if (variacoes.length === 0) {
          setMessage({ type: "error", text: "Adicione pelo menos uma variação (calibre, cano e valor)." });
          setSubmitLoading(false);
          return;
        }
        for (const v of variacoes) {
          if (!v.calibre_id || !String(v.comprimento_cano).trim() || !String(v.preco).trim()) {
            setMessage({ type: "error", text: "Preencha calibre, comprimento do cano e preço em todas as variações." });
            setSubmitLoading(false);
            return;
          }
        }

        if (editingId) {
          const updateData: any = {
            categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
            nome: form.nome || null,
            preco: null,
            funcionamento_id: form.funcionamento_id || null,
            espec_capacidade_tiros: form.espec_capacidade_tiros || null,
            espec_carregadores: form.espec_carregadores || null,
            marca_id: form.marca_id || null,
            calibres_id: null,
            espec_comprimento_cano: null,
            caracteristica_acabamento: form.caracteristica_acabamento || null,
            em_destaque: form.em_destaque || false,
          };
          const { error: updateError } = await supabase.from("armas").update(updateData).eq("id", editingId);
          if (updateError) throw updateError;

          const currentVariacaoIds = variacoes.map((v) => v.id).filter(Boolean) as string[];
          if (currentVariacaoIds.length > 0) {
            const { data: existingVar } = await supabase.from("variacoes_armas").select("id").eq("arma_id", editingId);
            const toDelete = (existingVar || []).filter((ev: any) => !currentVariacaoIds.includes(ev.id)).map((ev: any) => ev.id);
            if (toDelete.length > 0) await supabase.from("variacoes_armas").delete().in("id", toDelete);
          } else {
            await supabase.from("variacoes_armas").delete().eq("arma_id", editingId);
          }

          for (let i = 0; i < variacoes.length; i++) {
            const v = variacoes[i];
            const precoVar = parsePreco(v.preco);
            if (precoVar == null) continue;
            let variacaoId: string;
            if (v.id) {
              await supabase
                .from("variacoes_armas")
                .update({ calibre_id: v.calibre_id || null, comprimento_cano: v.comprimento_cano.trim(), preco: precoVar })
                .eq("id", v.id);
              variacaoId = v.id;
            } else {
              const { data: inserted, error: insErr } = await supabase
                .from("variacoes_armas")
                .insert({ arma_id: editingId, calibre_id: v.calibre_id || null, comprimento_cano: v.comprimento_cano.trim(), preco: precoVar })
                .select("id")
                .single();
              if (insErr || !inserted) throw insErr || new Error("Erro ao criar variação");
              variacaoId = inserted.id;
            }

            const fotosToRemove = v.fotosParaRemover || [];
            if (fotosToRemove.length > 0) {
              const { data: urls } = await supabase.from("fotos_armas").select("foto_url").in("id", fotosToRemove);
              if (urls) {
                const paths = urls.map((f: any) => f.foto_url?.includes("/fotos-armas/") ? f.foto_url.substring(f.foto_url.indexOf("/fotos-armas/") + "/fotos-armas/".length) : null).filter(Boolean);
                if (paths.length) await supabase.storage.from("fotos-armas").remove(paths);
              }
              await supabase.from("fotos_armas").delete().in("id", fotosToRemove);
            }

            const files = v.fotoFiles || [];
            if (files.length > 0) {
              // Buscar ordem base uma vez
              let ordemBase = 0;
              const { data: maxOrdem } = await supabase.from("fotos_armas").select("ordem").eq("variacao_id", variacaoId).order("ordem", { ascending: false }).limit(1);
              if (maxOrdem && maxOrdem[0]) ordemBase = (maxOrdem[0] as any).ordem + 1;
              
              // Upload paralelo de todas as fotos
              const uploadPromises = files.map(async (file, j) => {
                const ext = file.name.split(".").pop();
                const timestamp = Date.now();
                const path = `armas/${editingId}-var-${variacaoId}-${timestamp}-${j}.${ext}`;
                
                const { error: upErr } = await supabase.storage.from("fotos-armas").upload(path, file, { cacheControl: "3600", upsert: false });
                if (upErr) throw new Error(`Upload da foto ${j + 1}: ${upErr.message}`);
                
                const { data: pub } = supabase.storage.from("fotos-armas").getPublicUrl(path);
                const { error: insFoto } = await supabase.from("fotos_armas").insert({ 
                  arma_id: editingId, 
                  variacao_id: variacaoId, 
                  foto_url: pub.publicUrl, 
                  ordem: ordemBase + j 
                });
                if (insFoto) throw new Error(`Salvar foto ${j + 1}: ${insFoto.message}`);
              });
              
              await Promise.all(uploadPromises);
            }
          }

          setMessage({ type: "ok", text: "Arma atualizada com sucesso." });
        } else {
          const { data: insertData, error: insertError } = await supabase
            .from("armas")
            .insert({
              categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
              nome: form.nome || null,
              preco: null,
              funcionamento_id: form.funcionamento_id || null,
              espec_capacidade_tiros: form.espec_capacidade_tiros || null,
              espec_carregadores: form.espec_carregadores || null,
              marca_id: form.marca_id || null,
              calibres_id: null,
              espec_comprimento_cano: null,
              caracteristica_acabamento: form.caracteristica_acabamento || null,
              em_destaque: form.em_destaque || false,
            })
            .select("id")
            .single();
          if (insertError || !insertData) throw insertError || new Error("Erro ao cadastrar arma");
          const armaId = insertData.id as string;

          for (let i = 0; i < variacoes.length; i++) {
            const v = variacoes[i];
            const precoVar = parsePreco(v.preco);
            if (precoVar == null) continue;
            const { data: varRow, error: varErr } = await supabase
              .from("variacoes_armas")
              .insert({ arma_id: armaId, calibre_id: v.calibre_id || null, comprimento_cano: v.comprimento_cano.trim(), preco: precoVar })
              .select("id")
              .single();
            if (varErr || !varRow) throw varErr || new Error("Erro ao criar variação");
            const variacaoId = varRow.id;

            const files = v.fotoFiles || [];
            if (files.length > 0) {
              // Upload paralelo de todas as fotos
              const uploadPromises = files.map(async (file, j) => {
                const ext = file.name.split(".").pop();
                const timestamp = Date.now();
                const path = `armas/${armaId}-var-${variacaoId}-${timestamp}-${j}.${ext}`;
                
                const { error: upErr } = await supabase.storage.from("fotos-armas").upload(path, file, { cacheControl: "3600", upsert: false });
                if (upErr) throw new Error(`Upload da foto ${j + 1}: ${upErr.message}`);
                
                const { data: pub } = supabase.storage.from("fotos-armas").getPublicUrl(path);
                const { error: insFoto } = await supabase.from("fotos_armas").insert({ 
                  arma_id: armaId, 
                  variacao_id: variacaoId, 
                  foto_url: pub.publicUrl, 
                  ordem: j 
                });
                if (insFoto) throw new Error(`Salvar foto ${j + 1}: ${insFoto.message}`);
              });
              
              await Promise.all(uploadPromises);
            }
          }

          setMessage({ type: "ok", text: "Arma cadastrada com sucesso." });
        }

        // Aguardar um pouco para garantir que tudo foi salvo antes de recarregar
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchArmas();
        setTimeout(() => closeModal(), 1000);
        setSubmitLoading(false);
        return;
      }

      if (editingId) {
        // Editar arma existente (sem variação)
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
            const timestamp = Date.now();
            const filePath = `armas/${editingId}-${timestamp}-${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("fotos-armas")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              console.error("Erro no upload:", uploadError);
              throw new Error(`Erro ao fazer upload da foto ${index + 1}: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
              .from("fotos-armas")
              .getPublicUrl(filePath);

            // Inserir na tabela fotos_armas
            const { error: insertFotoError } = await supabase
              .from("fotos_armas")
              .insert({
                arma_id: editingId,
                foto_url: publicUrlData.publicUrl,
                ordem: ordemInicial + index,
              });

            if (insertFotoError) {
              console.error("Erro ao inserir foto:", insertFotoError);
              throw new Error(`Erro ao salvar URL da foto ${index + 1}: ${insertFotoError.message || insertFotoError.code || "Erro desconhecido"}`);
            }
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
            const timestamp = Date.now();
            const filePath = `armas/${armaId}-${timestamp}-${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("fotos-armas")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              console.error("Erro no upload:", uploadError);
              throw new Error(`Erro ao fazer upload da foto ${index + 1}: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
              .from("fotos-armas")
              .getPublicUrl(filePath);

            // Inserir na tabela fotos_armas
            const { error: insertFotoError } = await supabase
              .from("fotos_armas")
              .insert({
                arma_id: armaId,
                foto_url: publicUrlData.publicUrl,
                ordem: index,
              });

            if (insertFotoError) {
              console.error("Erro ao inserir foto:", insertFotoError);
              throw new Error(`Erro ao salvar URL da foto ${index + 1}: ${insertFotoError.message || insertFotoError.code || "Erro desconhecido"}`);
            }
          });

          await Promise.all(uploadPromises);
        }

        setMessage({ type: "ok", text: "Arma cadastrada com sucesso." });
      }

      // Aguardar um pouco para garantir que tudo foi salvo antes de recarregar
      await new Promise(resolve => setTimeout(resolve, 500));
      // Recarregar lista e fechar modal após 1 segundo
      await fetchArmas();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      setMessage({
        type: "error",
        text: err?.message || "Erro ao salvar produto. Verifique o console para mais detalhes.",
      });
    } finally {
      // Garantir que o loading sempre seja desativado
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

          {/* Abas de gerenciamento */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("armas")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "armas"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              Armas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("marcas")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "marcas"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              Marcas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calibres")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "calibres"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              Calibres
            </button>
          </div>

          {/* Conteúdo da aba Marcas */}
          {activeTab === "marcas" && (
            <section className="mb-6 rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Marcas</h2>
              </div>

              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={novaMarca}
                  onChange={(e) => setNovaMarca(e.target.value)}
                  className={inputClass}
                  placeholder="Nova marca"
                />
                <button
                  type="button"
                  onClick={handleCriarMarca}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 sm:w-auto"
                  style={{ backgroundColor: "#E9B20E" }}
                >
                  Adicionar marca
                </button>
              </div>

              <div className="space-y-2">
                {marcas.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhuma marca cadastrada. Cadastre uma nova acima.
                  </p>
                ) : (
                  marcas.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col items-start justify-between gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 sm:flex-row sm:items-center"
                    >
                      {marcaEditandoId === m.id ? (
                        <input
                          type="text"
                          value={marcaEditandoNome}
                          onChange={(e) =>
                            setMarcaEditandoNome(e.target.value)
                          }
                          className={inputClass}
                        />
                      ) : (
                        <span className="text-sm text-zinc-200">{m.nome}</span>
                      )}

                      <div className="flex gap-2">
                        {marcaEditandoId === m.id ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSalvarEdicaoMarca}
                              className="rounded px-3 py-1 text-xs font-medium text-zinc-900"
                              style={{ backgroundColor: "#E9B20E" }}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMarcaEditandoId(null);
                                setMarcaEditandoNome("");
                              }}
                              className="rounded px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleIniciarEdicaoMarca(m.id, m.nome)
                              }
                              className="rounded px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluirMarca(m.id)}
                              className="rounded px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Conteúdo da aba Calibres */}
          {activeTab === "calibres" && (
            <section className="mb-6 rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Calibres</h2>
              </div>

              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={novoCalibre}
                  onChange={(e) => setNovoCalibre(e.target.value)}
                  className={inputClass}
                  placeholder="Novo calibre"
                />
                <button
                  type="button"
                  onClick={handleCriarCalibre}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 sm:w-auto"
                  style={{ backgroundColor: "#E9B20E" }}
                >
                  Adicionar calibre
                </button>
              </div>

              <div className="space-y-2">
                {calibres.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhum calibre cadastrado. Cadastre um novo acima.
                  </p>
                ) : (
                  calibres.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col items-start justify-between gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 sm:flex-row sm:items-center"
                    >
                      {calibreEditandoId === c.id ? (
                        <input
                          type="text"
                          value={calibreEditandoNome}
                          onChange={(e) =>
                            setCalibreEditandoNome(e.target.value)
                          }
                          className={inputClass}
                        />
                      ) : (
                        <span className="text-sm text-zinc-200">{c.nome}</span>
                      )}

                      <div className="flex gap-2">
                        {calibreEditandoId === c.id ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSalvarEdicaoCalibre}
                              className="rounded px-3 py-1 text-xs font-medium text-zinc-900"
                              style={{ backgroundColor: "#E9B20E" }}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCalibreEditandoId(null);
                                setCalibreEditandoNome("");
                              }}
                              className="rounded px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleIniciarEdicaoCalibre(c.id, c.nome)
                              }
                              className="rounded px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluirCalibre(c.id)}
                              className="rounded px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Conteúdo da aba Armas */}
          {activeTab === "armas" && (
            <>
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
                  <p className="text-zinc-400">
                    Nenhuma arma encontrada com os filtros aplicados.
                  </p>
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
                          <td className="px-4 py-3 text-white">
                            {arma.nome || "-"}
                          </td>
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
            </>
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
                  <div className="flex items-center gap-3">
                    <input
                      id="comVariacao"
                      type="checkbox"
                      checked={comVariacao}
                      onChange={(e) => {
                        setComVariacao(e.target.checked);
                        if (!e.target.checked) setVariacoes([]);
                        else if (variacoes.length === 0) addVariacao();
                      }}
                      className="h-5 w-5 rounded border-zinc-600 bg-zinc-800/50 text-[#E9B20E] focus:ring-1 focus:ring-[#E9B20E]"
                    />
                    <label htmlFor="comVariacao" className="text-sm font-medium text-zinc-300 cursor-pointer">
                      Produto com variação (calibre, tamanho de cano e valor por opção)
                    </label>
                  </div>
                  <div>
                    <label htmlFor="foto" className={labelClass}>
                      Fotos da arma {!comVariacao && editingId && "(adicione novas fotos)"}
                      {comVariacao && " (fotos gerais; use a seção Variações para fotos por cano)"}
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
                  {!comVariacao && (
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
                  )}
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

              {/* Variações (calibre + cano + preço + fotos por opção) */}
              {comVariacao && (
                <section className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Variações (calibre, tamanho de cano e valor)
                    </h3>
                    <button
                      type="button"
                      onClick={addVariacao}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                      style={{ backgroundColor: "#E9B20E", color: "#030711" }}
                    >
                      + Adicionar variação
                    </button>
                  </div>
                  <div className="space-y-6">
                    {variacoes.map((v, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-600 bg-zinc-800/30 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-400">Variação {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeVariacao(idx)}
                            className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                          >
                            Remover
                          </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className={labelClass}>Calibre</label>
                            <select
                              value={v.calibre_id}
                              onChange={(e) => updateVariacao(idx, "calibre_id", e.target.value)}
                              className={inputClass}
                            >
                              <option value="">Selecione</option>
                              {calibres.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Comprimento do cano</label>
                            <input
                              type="text"
                              value={v.comprimento_cano}
                              onChange={(e) => updateVariacao(idx, "comprimento_cano", e.target.value)}
                              className={inputClass}
                              placeholder="Ex.: 4 pol."
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Preço (R$)</label>
                            <input
                              type="text"
                              value={v.preco}
                              onChange={(e) => updateVariacao(idx, "preco", e.target.value)}
                              className={inputClass}
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className={labelClass}>Fotos desta variação (tamanho de cano)</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleVariacaoFotoChange(idx, e)}
                            className={inputClass}
                          />
                          {v.fotosExistentes && v.fotosExistentes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {v.fotosExistentes.map((f) => (
                                <div key={f.id} className="relative">
                                  <img src={f.foto_url} alt="" className="h-20 w-20 rounded object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeVariacaoFotoExistente(idx, f.id)}
                                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {v.fotoPreviews && v.fotoPreviews.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {v.fotoPreviews.map((url, i) => (
                                <div key={i} className="relative">
                                  <img src={url} alt="" className="h-20 w-20 rounded object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeVariacaoFoto(idx, i)}
                                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

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
