"use strict";

const etapas = [
  {
    titulo: "Validar a identidade",
    caso: "Uma pessoa tenta consultar a vaga #104. A aplicação recebe uma conta conhecida e uma senha incorreta.",
    pergunta: "Qual resposta deve aparecer na simulação?",
    opcoes: ["200 · Vaga encontrada", "401 · Credenciais incorretas", "403 · Perfil sem permissão"],
    correta: 1,
    teste: { perfil: "invalido", existe: true },
    explicacao: "O servidor recusa a autenticação antes de avaliar o perfil.",
  },
  {
    titulo: "Aplicar a regra de exclusão",
    caso: "O operador já entrou no portal. Você está configurando a regra que vale no servidor quando alguém pede a exclusão de uma vaga.",
    pergunta: "Qual política deve ser aplicada?",
    opcoes: ["Permitir a exclusão a qualquer conta autenticada", "Ocultar o botão na interface", "Permitir a exclusão somente ao administrador"],
    correta: 2,
    explicacao: "A autorização verifica o perfil no servidor. A conta de operador pode consultar, cadastrar e alterar vagas.",
  },
  {
    titulo: "Conferir a vaga após a recusa",
    caso: "O operador executou um teste de exclusão da vaga #104. A resposta foi 403. Você precisa produzir evidência de que os dados foram preservados.",
    pergunta: "Qual teste você executa em seguida?",
    opcoes: ["Consultar a vaga #104 e confirmar que ela existe", "Consultar outra vaga qualquer", "Repetir a exclusão com o administrador antes da consulta"],
    correta: 0,
    teste: { perfil: "operador", existe: true },
    explicacao: "Consultar a mesma vaga confirma que a recusa também preservou o registro.",
  },
  {
    titulo: "Confirmar a exclusão autorizada",
    caso: "Com a vaga #104 inicialmente presente, o administrador executou o teste de exclusão. A aplicação simulada respondeu 204.",
    pergunta: "Qual resultado confirma o efeito esperado?",
    opcoes: ["Consultar a vaga como visitante e receber 401", "Consultar a mesma vaga com uma conta autorizada e receber 404", "Consultar a mesma vaga com uma conta autorizada e receber 200"],
    correta: 1,
    teste: { perfil: "admin", existe: false },
    explicacao: "A consulta autorizada que retorna 404 confirma que a vaga deixou de existir neste cenário.",
  },
  {
    titulo: "Proteger a senha armazenada",
    caso: "Durante a revisão, você encontra um campo de senha no cadastro. A equipe precisa definir como guardar e verificar as senhas.",
    pergunta: "Que mudança você aprova?",
    opcoes: ["Guardar o texto da senha e esconder o campo na tela", "Criptografar a senha para recuperá-la a cada login", "Armazenar o hash BCrypt e usar o verificador para conferir a senha"],
    correta: 2,
    explicacao: "O verificador usa a senha informada e o hash armazenado para conferir a correspondência. O salt faz parte do hash.",
  },
  {
    titulo: "Refatorar o cadastro",
    caso: "O método fazerCoisa valida o título da vaga e a remuneração. A equipe precisa melhorar a leitura sem alterar as regras atuais.",
    pergunta: "Qual alteração você aprova?",
    opcoes: ["Renomear para podeCadastrarVaga, extrair tituloValido e rodar os testes", "Passar a aceitar título vazio para encurtar o método", "Copiar a validação em todos os pontos de cadastro"],
    correta: 0,
    explicacao: "O nome explica a intenção, a extração esclarece a responsabilidade e os testes conferem se o comportamento foi preservado.",
  },
  {
    titulo: "Registrar a mudança no Git",
    caso: "Os testes de acesso e cadastro passaram. Você quer revisar o estado dos arquivos, preparar as mudanças e registrar o trabalho.",
    pergunta: "Qual sequência corresponde a esse fluxo?",
    opcoes: ["git add, git commit, git status", "git status, git add, git commit", "git status, git commit, git add"],
    correta: 1,
    explicacao: "O status mostra o estado dos arquivos. O add prepara o conteúdo e o commit registra a versão preparada.",
  },
];

const armazenamento = "lab-seguranca-web-desafio-v2";
const painel = document.getElementById("challenge");
const lista = document.getElementById("steps");
let sessao = carregarSessao();

function carregarSessao() {
  try {
    const salva = JSON.parse(localStorage.getItem(armazenamento));
    if (salva && typeof salva.nome === "string" && salva.nome.trim().length >= 2 && salva.nome.length <= 90 &&
        Number.isInteger(salva.concluido) && salva.concluido >= 0 && salva.concluido <= etapas.length &&
        (salva.concluido < etapas.length || Number.isFinite(new Date(salva.data).getTime()) && salva.data)) {
      return salva;
    }
  } catch {
    // O desafio pode continuar sem armazenamento persistente.
  }
  return { nome: "", concluido: 0, data: null };
}

function gravarSessao() {
  try {
    localStorage.setItem(armazenamento, JSON.stringify(sessao));
  } catch {
    // A sessão permanece disponível nesta página.
  }
}

function exibirInicio() {
  painel.innerHTML = `
    <h2>Antes de começar</h2>
    <p class="muted">Informe seu nome como deseja vê-lo no certificado. Para concluir, acerte as sete etapas. Você pode revisar e tentar novamente sempre que precisar.</p>
    <form><label for="nome">Nome para o certificado</label>
    <input id="nome" type="text" autocomplete="name" minlength="2" maxlength="90" required aria-describedby="privacidade-nome">
    <p id="privacidade-nome" class="muted">Seu nome e seu progresso ficam neste navegador.</p>
    <div class="actions"><button>Iniciar atividade</button></div><p class="feedback" role="status"></p></form>`;
  const formulario = painel.querySelector("form");
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = formulario.elements.nome.value.trim().replace(/\s+/g, " ");
    if (nome.length < 2) {
      painel.querySelector("[role=status]").textContent = "Informe um nome com pelo menos dois caracteres.";
      return;
    }
    sessao.nome = nome;
    gravarSessao();
    exibirEtapa(true);
  });
}

function atualizarProgresso() {
  const { concluido, nome } = sessao;
  document.getElementById("restart").hidden = !nome;
  document.getElementById("participante").textContent = nome;
  document.getElementById("progress").value = concluido;
  document.getElementById("progress-label").textContent = `${concluido} de ${etapas.length} etapas concluídas`;
  lista.replaceChildren(...etapas.map(({ titulo }, indice) => {
    const item = document.createElement("li");
    item.textContent = indice < concluido ? `${titulo} ✓` : titulo;
    if (indice < concluido) item.classList.add("done");
    if (indice === concluido) item.setAttribute("aria-current", "step");
    return item;
  }));
}

function exibirEtapa(moverFoco = false) {
  atualizarProgresso();
  const { concluido, nome } = sessao;
  const etapa = etapas[concluido];
  if (!nome) {
    exibirInicio();
  } else if (!etapa) {
    exibirCertificado();
  } else {
    const teste = etapa.teste ? `
      <div class="terminal">
        <button type="button" class="secondary" id="teste-etapa">Executar consulta de verificação</button>
        <p class="feedback" id="retorno-etapa" role="status">Consulta simulada da vaga #104.</p>
      </div>` : "";
    painel.innerHTML = `
      <p class="eyebrow">Etapa ${concluido + 1} de ${etapas.length}</p>
      <h2>${etapa.titulo}</h2><p class="muted">${etapa.caso}</p>${teste}
      <form><fieldset><legend>${etapa.pergunta}</legend>
      ${etapa.opcoes.map((opcao, i) => `<label class="option"><input type="radio" name="resposta" value="${i}" ${i === 0 ? "required" : ""}> <span>${opcao}</span></label>`).join("")}
      </fieldset><p class="feedback" role="status"></p>
      <div class="actions"><button>Conferir resposta</button><button type="button" id="avancar" hidden>${concluido + 1 === etapas.length ? "Ver certificado" : "Próxima etapa"}</button></div></form>`;
    const formulario = painel.querySelector("form");
    const feedback = painel.querySelector("[role=status]");
    const conferir = formulario.querySelector("button");
    const avancar = document.getElementById("avancar");
    let consultou = false;
    if (etapa.teste) {
      document.getElementById("teste-etapa").addEventListener("click", () => {
        const demonstracao = { vaga: etapa.teste.existe ? { remuneracao: 2400 } : null };
        document.getElementById("retorno-etapa").textContent =
          executarOperacao(demonstracao, etapa.teste.perfil, "consultar");
        consultou = true;
      });
    }
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      if (formulario.querySelector("fieldset").disabled) return;
      if (etapa.teste && !consultou) {
        feedback.dataset.kind = "retry";
        feedback.textContent = "Execute a consulta de verificação antes de enviar a resposta.";
        return;
      }
      const resposta = new FormData(formulario).get("resposta");
      if (resposta === null) return;
      if (Number(resposta) !== etapa.correta) {
        feedback.dataset.kind = "retry";
        feedback.textContent = "Revise a situação e tente outra opção. Você também pode consultar os laboratórios pelo menu.";
        return;
      }
      sessao.concluido += 1;
      if (sessao.concluido === etapas.length) sessao.data = new Date().toISOString();
      gravarSessao();
      atualizarProgresso();
      feedback.dataset.kind = "success";
      feedback.textContent = `Correto. ${etapa.explicacao}`;
      formulario.querySelector("fieldset").disabled = true;
      conferir.hidden = true;
      avancar.hidden = false;
      avancar.focus();
    });
    avancar.addEventListener("click", () => exibirEtapa(true));
  }
  if (moverFoco) painel.focus();
}

function exibirCertificado() {
  painel.innerHTML = `
    <p class="eyebrow">7 de 7 etapas concluídas</p><h2>Você concluiu a atividade com êxito</h2>
    <p class="muted">O certificado reconhece seu aproveitamento em Segurança em Aplicações Web.</p>
    <p><strong id="nome-certificado"></strong></p>
    <div class="actions"><button type="button">Baixar meu certificado em PDF</button></div>
    <p class="feedback" role="status"></p>`;
  document.getElementById("nome-certificado").textContent = sessao.nome;
  const feedback = painel.querySelector("[role=status]");
  const botao = painel.querySelector("button");
  botao.addEventListener("click", async () => {
    botao.disabled = true;
    try {
      await baixarCertificado(sessao.nome, new Date(sessao.data));
      feedback.textContent = "Certificado gerado. Confira os downloads do navegador.";
    } catch {
      feedback.textContent = "Houve um erro ao gerar o PDF. Tente novamente.";
    } finally {
      botao.disabled = false;
    }
  });
}

document.getElementById("restart").addEventListener("click", () => {
  if (!window.confirm("Deseja apagar o nome e o progresso desta atividade neste navegador?")) return;
  sessao = { nome: "", concluido: 0, data: null };
  gravarSessao();
  exibirEtapa(true);
});
exibirEtapa();
