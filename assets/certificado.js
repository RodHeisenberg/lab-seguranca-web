"use strict";

function desenharCertificado(nome, data) {
  const tela = document.createElement("canvas");
  tela.width = 2526;
  tela.height = 1785;
  const ctx = tela.getContext("2d");
  ctx.scale(3, 3);

  const verde = "#173d34";
  const dourado = "#9f773b";
  ctx.fillStyle = "#f9f6ed";
  ctx.fillRect(0, 0, 842, 595);
  ctx.fillStyle = verde;
  ctx.fillRect(0, 0, 842, 114);
  ctx.fillRect(0, 546, 842, 49);
  ctx.fillStyle = "#c9a86b";
  ctx.fillRect(0, 114, 842, 3);
  ctx.fillRect(0, 543, 842, 3);
  ctx.strokeStyle = "#ad915e";
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, 802, 555);
  ctx.strokeStyle = "#cdbb95";
  ctx.strokeRect(27, 27, 788, 541);

  function escrever(texto, y, fonte, cor = verde, largura = 700) {
    ctx.fillStyle = cor;
    ctx.textAlign = "center";
    ctx.font = fonte;
    ctx.fillText(texto, 421, y, largura);
  }

  escrever("LAB DE SEGURANÇA WEB", 52, "bold 14px system-ui", "#dfc48c");
  escrever("Segurança em Aplicações Web", 87, "26px Georgia", "#fffaf0");
  escrever("Certificado de aproveitamento", 185, "bold 40px Georgia");
  escrever("Concedido a", 219, "17px system-ui", "#364a40");
  escrever(nome, 274, "bold 45px Georgia", verde, 690);
  ctx.fillStyle = dourado;
  ctx.fillRect(340, 289, 162, 1);
  escrever("Concluiu com êxito as sete etapas da atividade de Segurança em Aplicações Web,", 323, "16px system-ui");
  escrever("demonstrando conhecimentos em autenticação, autorização, segurança de senhas", 347, "16px system-ui");
  escrever("com BCrypt, testes de acesso, Clean Code e registro de alterações com Git.", 371, "16px system-ui");

  ctx.beginPath();
  ctx.arc(421, 423, 30, 0, 2 * Math.PI);
  ctx.fillStyle = verde;
  ctx.fill();
  ctx.strokeStyle = "#c9a86b";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(421, 423, 25, 0, 2 * Math.PI);
  ctx.stroke();
  escrever("7 / 7", 429, "bold 16px system-ui", "#fffaf0");
  escrever("Professor Rodrigo Moreira", 483, "bold 19px system-ui");
  escrever(new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(data), 511, "15px system-ui");
  escrever("Atividade didática concluída", 562, "13px system-ui", "#fffaf0");

  return tela;
}

function montarPdf(jpeg, largura, altura) {
  const encoder = new TextEncoder();
  const blocos = [];
  const offsets = [0];
  let posicao = 0;

  function incluir(parte) {
    const bytes = typeof parte === "string" ? encoder.encode(parte) : parte;
    blocos.push(bytes);
    posicao += bytes.byteLength;
  }

  function objeto(numero, corpo) {
    offsets.push(posicao);
    incluir(`${numero} 0 obj\n`);
    corpo();
    incluir("\nendobj\n");
  }

  incluir("%PDF-1.4\n");
  objeto(1, () => incluir("<< /Type /Catalog /Pages 2 0 R >>"));
  objeto(2, () => incluir("<< /Type /Pages /Count 1 /Kids [3 0 R] >>"));
  objeto(3, () => incluir("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Imagem 4 0 R >> >> /Contents 5 0 R >>"));
  objeto(4, () => {
    incluir(`<< /Type /XObject /Subtype /Image /Width ${largura} /Height ${altura} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.byteLength} >>\nstream\n`);
    incluir(jpeg);
    incluir("\nendstream");
  });
  const conteudo = "q\n842 0 0 595 0 0 cm\n/Imagem Do\nQ\n";
  objeto(5, () => incluir(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}endstream`));
  const inicioTabela = posicao;
  incluir("xref\n0 6\n0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => incluir(`${String(offset).padStart(10, "0")} 00000 n \n`));
  incluir(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${inicioTabela}\n%%EOF\n`);
  return new Blob(blocos, { type: "application/pdf" });
}

async function baixarCertificado(nome, data) {
  const tela = desenharCertificado(nome, data);
  const imagem = await new Promise((resolve) => tela.toBlob(resolve, "image/jpeg", 0.98));
  if (!imagem) throw new Error("Falha na conversão do certificado.");
  const pdf = montarPdf(new Uint8Array(await imagem.arrayBuffer()), tela.width, tela.height);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement("a");
  link.href = url;
  const arquivo = nome.normalize("NFD").replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80);
  link.download = arquivo ? `certificado-seguranca-web-${arquivo}.pdf` : "certificado-seguranca-web.pdf";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
