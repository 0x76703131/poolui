# Frontend para pools em CryptoNight

### Interface em AngularJS para a [nodejs-pool](https://github.com/Snipa22/nodejs-pool)

Esta interface é um fork do trabalho realizado pelo [mesh0000](https://github.com/mesh0000/poolui).

### Funcionalidades
- Front-end traduzido para português nas principais páginas.
- Página de FAQ customizada.
- Acompanhe seu hashrate em todas as páginas.
- Acompanhe múltiplos endereços de pagamento.
- Aviso sonoro quando o hashrate fica abaixo de um certo limite.
- Gráficos por minerador e histórico de pagamentos.
- Console administrativo para o minerador alterar o pagamento mínimo e alertas por e-mail.
- Interface para o administrador da pool.
- Todos os recursos normais, entre outros.

### Executar

A página inicial é definida em welcome.html
Parâmetros da pool definidos em app/globals.js.default e copiados para app/globals.js

É necessário o NodeJS

```sh
$ npm start # starts gulp + livereload, serves from ./build on 8080
```

## Deploy
```sh
$ npm install # runs everything, serve from ./build
```

#### Doações

versão traduzida por vp11: 46YLZhJbywCHkMfggSpVmvgyzpYfTKY3rTi19iBSuvw88vYxXADS3d5XzPeGF2FjSKjJpmjj3YRznDgGG8HZHHdy7H9DHiR

mesh0000 (criador original): 42yCGRP2p6bZzMjJxKpJtTFRz2x3X3eBYD97T17zdxC9NiGNWafCaU54MKWBZkHb9AVb4XBgcjkPGW8hjQyBM2vMMvVCzTj
