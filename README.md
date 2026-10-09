# Rede Atlas — proposta de modernização

Protótipo de apresentação baseado no site https://cliente.redeatlas.com/cliente.
Preserva a marca, o vídeo institucional, os quatro planos e o catálogo de parceiros da proposta existente.
Preços e telefones conferidos no site de referência em 09/10/2026.

## Visualização

Abra `index.html` diretamente ou, na pasta `proposta`, execute:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Acesse http://127.0.0.1:4173.

## Arquivos

- `index.html`: conteúdo e estrutura da apresentação.
- `styles.css`: identidade visual e adaptação para celular.
- `app.js`: planos, pesquisa, filtros de parceiros, menu e vídeo.
- `index.before-modernization.html`: cópia da proposta anterior.

## Limites do protótipo

Contratação direciona ao atendimento; acesso à conta abre o portal oficial. Não há backend de contratação ou autenticação. A ilustração do aplicativo representa uma proposta visual. Os contatos das unidades usam ligação telefônica, pois os destinos de WhatsApp não foram confirmados. A fonte Manrope é carregada pelo Google Fonts, com alternativa local se estiver indisponível.

## Verificação

Sintaxe JavaScript, alternância Família/Pet, carregamento de mais parceiros, busca sem resultados e limpeza, filtro por cidade, menu mobile e ausência de rolagem horizontal em 390 px verificados. Nenhum erro de console observado durante os testes.
