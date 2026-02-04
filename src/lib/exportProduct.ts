import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ProdutoData = {
  nome: string;
  preco: number | null;
  marca?: { nome: string } | null;
  calibre?: { nome: string } | null;
  funcionamento?: { nome: string } | null;
  categoria?: { nome: string } | null;
  espec_capacidade_tiros?: string | null;
  espec_carregadores?: string | null;
  espec_comprimento_cano?: string | null;
  caracteristica_acabamento?: string | null;
  foto_url: string | null;
};

type Parcela = {
  vezes: number;
  valorParcela: number;
  valorTotal: number;
  comJuros: boolean;
};

// Função auxiliar para carregar imagem
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Função para formatar preço
function formatPrice(price: number | null): string {
  if (price == null) return 'N/A';
  return parseFloat(price.toString()).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function exportProductToPDF(
  produto: ProdutoData,
  parcelas: Parcela[],
  logoUrl: string = '/logo.png'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Fundo escuro
  doc.setFillColor(3, 7, 17); // Cor de fundo escura #030711
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Logo centralizado no topo
  try {
    const logoImg = await loadImage(logoUrl);
    const logoHeight = 15;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    const logoX = (pageWidth - logoWidth) / 2;
    
    doc.addImage(logoImg, 'PNG', logoX, yPosition, logoWidth, logoHeight);
    yPosition += logoHeight + 25; // Aumentado de 15 para 25
  } catch (error) {
    console.warn('Erro ao carregar logo:', error);
  }

  // Seção principal: Foto à esquerda e informações à direita
  const fotoWidth = 100; // Largura da foto (aumentado de 70 para 100)
  const infoX = margin + fotoWidth + 15; // Posição X das informações (aumentado de 10 para 15)
  const infoWidth = contentWidth - fotoWidth - 15;

  // Foto do produto (lado esquerdo)
  if (produto.foto_url) {
    try {
      const fotoImg = await loadImage(produto.foto_url);
      const fotoHeight = 130; // Aumentado de 90 para 130
      const imgRatio = fotoImg.width / fotoImg.height;
      let imgWidth = fotoHeight * imgRatio;
      let imgHeight = fotoHeight;
      
      // Ajustar se a largura exceder o espaço disponível
      if (imgWidth > fotoWidth) {
        imgWidth = fotoWidth;
        imgHeight = fotoWidth / imgRatio;
      }
      
      const imgX = margin + (fotoWidth - imgWidth) / 2;
      doc.addImage(fotoImg, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
    } catch (error) {
      console.warn('Erro ao carregar foto:', error);
    }
  }

  // Informações do produto (lado direito)
  let infoY = yPosition;

  // Marca
  if (produto.marca?.nome) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(produto.marca.nome, infoX, infoY);
    infoY += 8; // Aumentado de 6 para 8
  }

  // Nome do produto
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const nomeLines = doc.splitTextToSize(produto.nome || 'Produto', infoWidth);
  doc.text(nomeLines, infoX, infoY);
  infoY += nomeLines.length * 7 + 12; // Aumentado de 8 para 12

  // Preço
  if (produto.preco != null) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Valor à vista', infoX, infoY);
    infoY += 8; // Aumentado de 6 para 8
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(233, 178, 14); // Cor dourada
    doc.text(`R$ ${formatPrice(produto.preco)}`, infoX, infoY);
    infoY += 12; // Aumentado de 8 para 12
  }

  // Avançar para próxima seção
  yPosition = Math.max(yPosition + 130, infoY) + 25; // Ajustado para o novo tamanho da foto (130)

  // Seção de Especificações com borda dourada
  const especsStartY = yPosition;
  
  // Calcular altura necessária primeiro
  const especs = [
    produto.marca && { label: 'Marca', value: produto.marca.nome },
    produto.calibre && { label: 'Calibre', value: produto.calibre.nome },
    produto.funcionamento && { label: 'Funcionamento', value: produto.funcionamento.nome },
    produto.espec_capacidade_tiros && { label: 'Capacidade de Tiros', value: produto.espec_capacidade_tiros },
    produto.espec_carregadores && { label: 'Carregadores', value: produto.espec_carregadores },
    produto.espec_comprimento_cano && { label: 'Comprimento do Cano', value: produto.espec_comprimento_cano },
    produto.caracteristica_acabamento && { label: 'Acabamento', value: produto.caracteristica_acabamento },
    produto.categoria && { label: 'Categoria', value: produto.categoria.nome },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const numRows = Math.ceil(especs.length / 2);
  const especsBoxHeight = 22 + (numRows * 16); // Título + linhas (aumentado espaçamento e padding)
  
  // Desenhar borda dourada e fundo primeiro
  doc.setDrawColor(233, 178, 14);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, especsStartY, contentWidth, especsBoxHeight, 2, 2, 'D');
  
  // Fundo escuro da caixa
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(margin + 0.5, especsStartY + 0.5, contentWidth - 1, especsBoxHeight - 1, 1.5, 1.5, 'F');
  
  // Agora escrever o conteúdo por cima
  yPosition = especsStartY + 10; // Aumentado padding superior
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Especificações', margin + 8, yPosition); // Aumentado padding lateral
  yPosition += 12; // Aumentado de 10 para 12

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Dividir em duas colunas
  const col1X = margin + 10; // Aumentado padding lateral
  const col2X = margin + contentWidth / 2 + 12; // Aumentado espaçamento entre colunas
  let col1Y = yPosition;
  let col2Y = yPosition;

  especs.forEach((spec, index) => {
    const isCol1 = index % 2 === 0;
    const currentX = isCol1 ? col1X : col2X;
    let currentY = isCol1 ? col1Y : col2Y;

    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(spec.label, currentX, currentY);
    currentY += 6; // Aumentado de 5 para 6

    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(spec.value, currentX, currentY);
    currentY += 10; // Aumentado de 8 para 10

    if (isCol1) {
      col1Y = currentY;
    } else {
      col2Y = currentY;
    }
  });

  // Salvar PDF
  doc.save(`${produto.nome?.replace(/[^a-z0-9]/gi, '_') || 'produto'}.pdf`);
}

// Função alternativa para exportar como imagem PNG
export async function exportProductToImage(
  produto: ProdutoData,
  parcelas: Parcela[],
  logoUrl: string = '/logo.png'
) {
  // Criar elemento HTML temporário
  const container = document.createElement('div');
  container.style.width = '1000px';
  container.style.height = '1250px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#030711';
  container.style.color = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.boxSizing = 'border-box';
  container.style.overflow = 'hidden';

  // Logo
  const logoDiv = document.createElement('div');
  logoDiv.style.textAlign = 'right';
  logoDiv.style.marginBottom = '30px';
  const logoImg = document.createElement('img');
  logoImg.src = logoUrl;
  logoImg.style.height = '60px';
  logoImg.style.objectFit = 'contain';
  logoDiv.appendChild(logoImg);
  container.appendChild(logoDiv);

  // Título
  const title = document.createElement('h1');
  title.textContent = produto.nome || 'Produto';
  title.style.fontSize = '40px';
  title.style.fontWeight = 'bold';
  title.style.color = '#E9B20E';
  title.style.marginBottom = '15px';
  container.appendChild(title);

  // Marca
  if (produto.marca?.nome) {
    const marca = document.createElement('p');
    marca.textContent = produto.marca.nome;
    marca.style.color = '#999';
    marca.style.marginBottom = '25px';
    marca.style.fontSize = '18px';
    container.appendChild(marca);
  }

  // Foto
  if (produto.foto_url) {
    const fotoDiv = document.createElement('div');
    fotoDiv.style.textAlign = 'center';
    fotoDiv.style.marginBottom = '20px';
    const fotoImg = document.createElement('img');
    fotoImg.src = produto.foto_url;
    fotoImg.style.maxWidth = '500px';
    fotoImg.style.maxHeight = '400px';
    fotoImg.style.borderRadius = '8px';
    fotoImg.style.objectFit = 'contain';
    fotoDiv.appendChild(fotoImg);
    container.appendChild(fotoDiv);
  }

  // Preço
  if (produto.preco != null) {
    const precoDiv = document.createElement('div');
    precoDiv.style.marginBottom = '25px';
    const precoLabel = document.createElement('p');
    precoLabel.textContent = 'Valor à vista';
    precoLabel.style.color = '#999';
    precoLabel.style.fontSize = '16px';
    precoLabel.style.marginBottom = '8px';
    precoDiv.appendChild(precoLabel);
    const precoValor = document.createElement('p');
    precoValor.textContent = `R$ ${formatPrice(produto.preco)}`;
    precoValor.style.fontSize = '44px';
    precoValor.style.fontWeight = 'bold';
    precoValor.style.color = '#E9B20E';
    precoDiv.appendChild(precoValor);
    container.appendChild(precoDiv);
  }

  // Especificações com borda dourada
  const especsContainer = document.createElement('div');
  especsContainer.style.marginBottom = '25px';
  especsContainer.style.border = '2px solid #E9B20E';
  especsContainer.style.borderRadius = '8px';
  especsContainer.style.padding = '20px';
  especsContainer.style.backgroundColor = 'rgba(20, 20, 20, 0.5)';

  const especsTitle = document.createElement('h2');
  especsTitle.textContent = 'Especificações';
  especsTitle.style.fontSize = '24px';
  especsTitle.style.fontWeight = 'bold';
  especsTitle.style.marginBottom = '20px';
  especsTitle.style.color = '#ffffff';
  especsTitle.style.textAlign = 'center';
  especsContainer.appendChild(especsTitle);

  const especs = [
    produto.marca && { label: 'Marca', value: produto.marca.nome },
    produto.calibre && { label: 'Calibre', value: produto.calibre.nome },
    produto.funcionamento && { label: 'Funcionamento', value: produto.funcionamento.nome },
    produto.espec_capacidade_tiros && { label: 'Capacidade de Tiros', value: produto.espec_capacidade_tiros },
    produto.espec_carregadores && { label: 'Carregadores', value: produto.espec_carregadores },
    produto.espec_comprimento_cano && { label: 'Comprimento do Cano', value: produto.espec_comprimento_cano },
    produto.caracteristica_acabamento && { label: 'Acabamento', value: produto.caracteristica_acabamento },
    produto.categoria && { label: 'Categoria', value: produto.categoria.nome },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  // Criar grid de duas colunas
  const especsGrid = document.createElement('div');
  especsGrid.style.display = 'grid';
  especsGrid.style.gridTemplateColumns = '1fr 1fr';
  especsGrid.style.gap = '20px 40px';

  especs.forEach((spec) => {
    const specItem = document.createElement('div');
    specItem.style.display = 'flex';
    specItem.style.flexDirection = 'column';
    specItem.style.gap = '4px';

    const specLabel = document.createElement('span');
    specLabel.textContent = spec.label;
    specLabel.style.color = '#999';
    specLabel.style.fontSize = '14px';
    specLabel.style.fontWeight = 'normal';

    const specValue = document.createElement('span');
    specValue.textContent = spec.value;
    specValue.style.color = '#ffffff';
    specValue.style.fontSize = '16px';
    specValue.style.fontWeight = 'bold';

    specItem.appendChild(specLabel);
    specItem.appendChild(specValue);
    especsGrid.appendChild(specItem);
  });

  especsContainer.appendChild(especsGrid);
  container.appendChild(especsContainer);

  document.body.appendChild(container);

  // Aguardar carregamento das imagens
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Converter para canvas com tamanho fixo de 1000x1500
  const canvas = await html2canvas(container, {
    backgroundColor: '#030711',
    width: 1000,
    height: 1250,
    scale: 1,
    useCORS: true,
    logging: false,
  });

  // Remover elemento temporário
  document.body.removeChild(container);

  // Converter para JPEG com qualidade 0.85 (85%) para reduzir tamanho
  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  const link = document.createElement('a');
  link.download = `${produto.nome?.replace(/[^a-z0-9]/gi, '_') || 'produto'}.jpg`;
  link.href = imgData;
  link.click();
}

// Nova função para gerar imagem e compartilhar no WhatsApp
export async function exportProductToImageAndShare(
  produto: ProdutoData,
  parcelas: Parcela[],
  logoUrl: string = '/logo.png',
  phoneNumber?: string
) {
  // Criar elemento HTML temporário
  const container = document.createElement('div');
  container.style.width = '1000px';
  container.style.height = '1250px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#030711';
  container.style.color = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.boxSizing = 'border-box';
  container.style.overflow = 'hidden';

  // Logo
  const logoDiv = document.createElement('div');
  logoDiv.style.textAlign = 'right';
  logoDiv.style.marginBottom = '30px';
  const logoImg = document.createElement('img');
  logoImg.src = logoUrl;
  logoImg.style.height = '60px';
  logoImg.style.objectFit = 'contain';
  logoDiv.appendChild(logoImg);
  container.appendChild(logoDiv);

  // Título
  const title = document.createElement('h1');
  title.textContent = produto.nome || 'Produto';
  title.style.fontSize = '40px';
  title.style.fontWeight = 'bold';
  title.style.color = '#E9B20E';
  title.style.marginBottom = '15px';
  container.appendChild(title);

  // Marca
  if (produto.marca?.nome) {
    const marca = document.createElement('p');
    marca.textContent = produto.marca.nome;
    marca.style.color = '#999';
    marca.style.marginBottom = '25px';
    marca.style.fontSize = '18px';
    container.appendChild(marca);
  }

  // Foto
  if (produto.foto_url) {
    const fotoDiv = document.createElement('div');
    fotoDiv.style.textAlign = 'center';
    fotoDiv.style.marginBottom = '20px';
    const fotoImg = document.createElement('img');
    fotoImg.src = produto.foto_url;
    fotoImg.style.maxWidth = '500px';
    fotoImg.style.maxHeight = '400px';
    fotoImg.style.borderRadius = '8px';
    fotoImg.style.objectFit = 'contain';
    fotoDiv.appendChild(fotoImg);
    container.appendChild(fotoDiv);
  }

  // Preço
  if (produto.preco != null) {
    const precoDiv = document.createElement('div');
    precoDiv.style.marginBottom = '25px';
    const precoLabel = document.createElement('p');
    precoLabel.textContent = 'Valor à vista';
    precoLabel.style.color = '#999';
    precoLabel.style.fontSize = '16px';
    precoLabel.style.marginBottom = '8px';
    precoDiv.appendChild(precoLabel);
    const precoValor = document.createElement('p');
    precoValor.textContent = `R$ ${formatPrice(produto.preco)}`;
    precoValor.style.fontSize = '44px';
    precoValor.style.fontWeight = 'bold';
    precoValor.style.color = '#E9B20E';
    precoDiv.appendChild(precoValor);
    container.appendChild(precoDiv);
  }

  // Especificações com borda dourada
  const especsContainer = document.createElement('div');
  especsContainer.style.marginBottom = '25px';
  especsContainer.style.border = '2px solid #E9B20E';
  especsContainer.style.borderRadius = '8px';
  especsContainer.style.padding = '20px';
  especsContainer.style.backgroundColor = 'rgba(20, 20, 20, 0.5)';

  const especsTitle = document.createElement('h2');
  especsTitle.textContent = 'Especificações';
  especsTitle.style.fontSize = '24px';
  especsTitle.style.fontWeight = 'bold';
  especsTitle.style.marginBottom = '20px';
  especsTitle.style.color = '#ffffff';
  especsTitle.style.textAlign = 'center';
  especsContainer.appendChild(especsTitle);

  const especs = [
    produto.marca && { label: 'Marca', value: produto.marca.nome },
    produto.calibre && { label: 'Calibre', value: produto.calibre.nome },
    produto.funcionamento && { label: 'Funcionamento', value: produto.funcionamento.nome },
    produto.espec_capacidade_tiros && { label: 'Capacidade de Tiros', value: produto.espec_capacidade_tiros },
    produto.espec_carregadores && { label: 'Carregadores', value: produto.espec_carregadores },
    produto.espec_comprimento_cano && { label: 'Comprimento do Cano', value: produto.espec_comprimento_cano },
    produto.caracteristica_acabamento && { label: 'Acabamento', value: produto.caracteristica_acabamento },
    produto.categoria && { label: 'Categoria', value: produto.categoria.nome },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  // Criar grid de duas colunas
  const especsGrid = document.createElement('div');
  especsGrid.style.display = 'grid';
  especsGrid.style.gridTemplateColumns = '1fr 1fr';
  especsGrid.style.gap = '20px 40px';

  especs.forEach((spec) => {
    const specItem = document.createElement('div');
    specItem.style.display = 'flex';
    specItem.style.flexDirection = 'column';
    specItem.style.gap = '4px';

    const specLabel = document.createElement('span');
    specLabel.textContent = spec.label;
    specLabel.style.color = '#999';
    specLabel.style.fontSize = '14px';
    specLabel.style.fontWeight = 'normal';

    const specValue = document.createElement('span');
    specValue.textContent = spec.value;
    specValue.style.color = '#ffffff';
    specValue.style.fontSize = '16px';
    specValue.style.fontWeight = 'bold';

    specItem.appendChild(specLabel);
    specItem.appendChild(specValue);
    especsGrid.appendChild(specItem);
  });

  especsContainer.appendChild(especsGrid);
  container.appendChild(especsContainer);

  document.body.appendChild(container);

  // Aguardar carregamento das imagens
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Converter para canvas
  const canvas = await html2canvas(container, {
    backgroundColor: '#030711',
    width: 1000,
    height: 1250,
    scale: 1,
    useCORS: true,
    logging: false,
  });

  // Remover elemento temporário
  document.body.removeChild(container);

  // Converter para JPEG
  canvas.toBlob(async (blob) => {
    if (!blob) {
      alert('Erro ao gerar imagem');
      return;
    }

    // Tentar usar Web Share API (funciona em dispositivos móveis)
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], `${produto.nome?.replace(/[^a-z0-9]/gi, '_') || 'produto'}.jpg`, {
          type: 'image/jpeg',
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: produto.nome || 'Produto',
            text: `Confira este produto: ${produto.nome}`,
          });
          return;
        }
      } catch (error) {
        console.log('Web Share API não disponível, usando fallback');
      }
    }

    // Fallback: converter para base64 e abrir WhatsApp Web
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Criar link temporário para download primeiro
      const link = document.createElement('a');
      link.download = `${produto.nome?.replace(/[^a-z0-9]/gi, '_') || 'produto'}.jpg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      
      // Abrir WhatsApp Web com mensagem
      const message = encodeURIComponent(`Confira este produto: ${produto.nome || 'Produto'}`);
      const whatsappUrl = phoneNumber
        ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`
        : `https://web.whatsapp.com/send?text=${message}`;
      
      window.open(whatsappUrl, '_blank');
    };
    reader.readAsDataURL(blob);
  }, 'image/jpeg', 0.85);
}

