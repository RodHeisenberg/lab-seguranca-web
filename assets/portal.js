"use strict";

function executarOperacao(estado, perfil, operacao, remuneracao = 2600) {
  if (perfil === "anonimo") return "401 · Credenciais ausentes.";
  if (perfil === "invalido") return "401 · Credenciais incorretas.";
  if (operacao === "excluir" && perfil !== "admin") return "403 · Apenas o administrador pode excluir.";
  if (operacao === "cadastrar") {
    if (estado.vaga) return "409 · A vaga de demonstração já existe.";
    estado.vaga = { remuneracao: 2400 };
    return "201 · Vaga cadastrada.";
  }
  if (!estado.vaga) return "404 · Vaga não encontrada.";
  if (operacao === "excluir") {
    estado.vaga = null;
    return "204 · Vaga excluída.";
  }
  if (operacao === "alterar") {
    estado.vaga.remuneracao = remuneracao;
    return "200 · Remuneração atualizada.";
  }
  return "200 · Vaga encontrada.";
}

