# Objetos, Dados e Assincronismo – Semana 05

Mini projeto com manipulação de dados, `fetch` + `async/await` e os quatro
estados de tela (Carregando, Erro, Vazio, Sucesso). Abra `index.html` no
navegador (Console em F12).

- **Parte 1** (Console): valida pedidos, filtra os pagos, soma com `reduce` e
  formata com `toFixed(2)`.
- **Parte 2**: Buscador de CEP (ViaCEP), com validação por regex, histórico de
  buscas e timeout de 5s via `AbortSignal.timeout`.
- **Parte 3**: Mini Pokédex (PokéAPI), com erro 404 tratado como
  "Pokémon não encontrado".

Os dados das APIs são inseridos com `createElement` + `textContent` (nunca
`innerHTML`) para evitar XSS.

## Reflexão: por que `Promise.all` pode ser mais rápido que vários `await` seguidos?

Com `await` em sequência, a próxima requisição só começa depois que a anterior
termina: o tempo total é a **soma** dos tempos. Com `Promise.all`, todas as
requisições são disparadas ao mesmo tempo (em paralelo) e o código espera todas
terminarem juntas: o tempo total é aproximadamente o da **mais lenta**. Isso
aproveita melhor o tempo de rede, desde que as requisições sejam independentes.

```js
// sequencial: ~ t1 + t2
const a = await fetch(urlA);
const b = await fetch(urlB);

// paralelo: ~ max(t1, t2)
const [a2, b2] = await Promise.all([fetch(urlA), fetch(urlB)]);
```
