# Lab de Segurança Web

Material de aula do Professor Rodrigo Moreira. A página inicial reúne o objetivo da aula, conceitos e referências. Os laboratórios e a atividade aplicam esses conhecimentos ao Portal de Vagas.

## Abrir ou publicar

- Para abrir localmente, extraia o ZIP e abra `index.html` no navegador.
- Para publicar, envie o conteúdo extraído à raiz do seu repositório. A pasta `assets` deve ficar ao lado de `index.html`.
- Nas configurações do repositório, em **Pages**, selecione **Deploy from a branch**, a branch `main` e o diretório `/ (root)`. Salve e use o endereço que o GitHub Pages disponibilizar.

## Condução em aula

1. Abra **Conceitos** e apresente o objetivo da aula e as definições de autenticação e autorização.
2. Em **Laboratórios**, compare as credenciais ausentes e a senha incorreta. Como operador, tente excluir a vaga e confirme que ela permanece. Como administrador, exclua e consulte novamente. Use a asserção para comparar o status previsto com o obtido. O botão **Restaurar ambiente** repõe o registro e limpa o histórico.
3. Alterne os saltos no exemplo de BCrypt e confira as duas senhas de teste. Os hashes foram calculados previamente. A conferência é ilustrativa.
4. Alterne as versões do código e rode os três testes em cada uma e proponha um teste com título e remuneração escolhidos pela turma. Depois, simule a sequência de Git.
5. Em **Desafio**, o aluno informa o nome no início e resolve sete etapas com autocorreção. Ao concluir com êxito, baixa o certificado de aproveitamento em PDF com o nome e a data de conclusão.

As simulações são executadas no navegador com dados fictícios. Os exemplos de Java ilustram o código, e o laboratório executa modelos equivalentes em JavaScript para os casos apresentados. O certificado é uma recompensa didática, com nome e progresso armazenados no navegador. Em um computador compartilhado, use **Recomeçar atividade** entre participantes.
