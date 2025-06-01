# BAR - Sistema de Gestão de Vendas

Um sistema moderno de gestão de vendas desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- [Next.js](https://nextjs.org/) - Framework React para produção
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [NextAuth.js](https://next-auth.js.org/) - Autenticação para Next.js
- [React Hook Form](https://react-hook-form.com/) - Gerenciamento de formulários
- [Zod](https://zod.dev/) - Validação de esquemas

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Git

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd BAR
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_secreta_aqui
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🛠️ Estrutura do Projeto

```
BAR/
├── components/         # Componentes React reutilizáveis
├── pages/             # Páginas e rotas da aplicação
│   ├── api/          # Endpoints da API
│   └── auth/         # Rotas de autenticação
├── public/           # Arquivos estáticos
├── styles/           # Estilos globais
└── types/            # Definições de tipos TypeScript
```

## 🔐 Autenticação

O sistema utiliza NextAuth.js para gerenciar a autenticação. Os usuários podem fazer login com suas credenciais e são redirecionados para a página de vendas após a autenticação bem-sucedida.

## 📱 Funcionalidades

- Autenticação de usuários
- Gestão de vendas
- Interface responsiva
- Validação de formulários
- Feedback visual de ações
- Proteção de rotas

## 🚀 Como Usar

1. Acesse a página inicial (`/`)
2. Faça login com suas credenciais
3. Após o login, você será redirecionado para a página de vendas
4. Navegue pelo sistema usando o menu de navegação

## 🔒 Segurança

- Autenticação baseada em sessão
- Proteção de rotas
- Validação de dados
- Variáveis de ambiente para configurações sensíveis

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no repositório.
