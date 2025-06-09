# BAR - Sistema de Vendas

Sistema de vendas com suporte a comandas, produtos, atendentes e impressão de cupons.

## Requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Android Studio (para desenvolvimento Android)
- JDK (Java Development Kit)

## Instalação

1. Clone o repositório:

```bash
git clone [URL_DO_REPOSITÓRIO]
cd BAR
```

2. Instale as dependências:

```bash
npm install
```

## Desenvolvimento

### Construir APK para Desenvolvimento

Para construir o APK de desenvolvimento:

```bash
npm run build:dev:apk
```

Este comando irá:

1. Gerar a configuração necessária
2. Construir o projeto Next.js
3. Sincronizar com o Capacitor
4. Gerar o APK de debug

O APK será gerado em `apk/bar.apk`

### Executar em Modo de Desenvolvimento

Para executar o projeto em modo de desenvolvimento (servidor + frontend):

```bash
npm run dev:all
```

Este comando irá:

1. Iniciar o servidor Express na porta 3001
2. Iniciar o servidor de desenvolvimento Next.js na porta 3000

## Estrutura do Projeto

- `/pages` - Páginas da aplicação Next.js
- `/components` - Componentes React reutilizáveis
- `/server` - Servidor Express
- `/data` - Arquivos JSON de dados
- `/android` - Projeto Android nativo
- `/scripts` - Scripts de configuração e build

## Configuração

O projeto usa um arquivo de configuração gerado automaticamente. Para gerar a configuração:

```bash
npm run generate:config
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento Next.js
- `npm run build` - Constrói o projeto para produção
- `npm run start` - Inicia o servidor de produção
- `npm run build:dev:apk` - Constrói o APK de desenvolvimento
- `npm run dev:all` - Inicia o servidor e o frontend em modo de desenvolvimento
- `npm run cap:sync` - Sincroniza as alterações com o projeto Android
- `npm run cap:open:android` - Abre o projeto no Android Studio

## Notas Importantes

1. Certifique-se de que o Android Studio está configurado corretamente
2. O APK de desenvolvimento é assinado com uma chave de debug
3. Para produção, será necessário configurar uma chave de assinatura apropriada
4. O servidor Express roda na porta 3001 por padrão
5. O frontend Next.js roda na porta 3000 por padrão

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
