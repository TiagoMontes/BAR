# 📱 Documentação de Uso do Projeto

## 🔧 Requisitos

- Node.js instalado (versão 18 ou superior recomendada)
- Git instalado
- Dispositivo Android com Bluetooth ativado
- Impressora Bluetooth Low Energy (BLE) ligada
- Conexão com rede intranet (Wi-Fi)

---

## 🚀 Passo a Passo para Instalação e Uso

### 1. Clonar o Projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd <nome-da-pasta-do-projeto>
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Conectar Todos os Dispositivos à Mesma Rede

- O **dispositivo Android** e o **computador com o servidor** devem estar conectados na mesma rede Wi-Fi (intranet).

### 4. Iniciar o Projeto

```bash
npm run dev:all
```

> Isso inicia o frontend Next.js e o backend Express juntos.

### 5. Acessar a Aplicação no Dispositivo

- No navegador do Android ou WebView:
  - Acesse o IP local da máquina onde o projeto está rodando.
  - Exemplo: `http://192.168.0.10:3000` (substitua pelo IP real da máquina).

---

## 🖨️ Configuração da Impressora Bluetooth

1. Certifique-se de que a impressora esteja **ligada**.
2. Certifique-se de que o Bluetooth do dispositivo Android esteja **ativado**.
3. Abra o app e clique em **"Procurar dispositivo"**.
4. Selecione sua **impressora BLE**.
5. Após conexão, **imprima um teste** para verificar o funcionamento.

---

## 📝 Comandos Importantes

| Comando                   | Descrição                                             |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Inicia apenas o frontend Next.js                      |
| `npm run start`           | Inicia aplicação já compilada                         |
| `npm run build:dev:apk`   | Gera o APK para testes com config atual               |
| `npm run dev:all`         | Inicia o frontend e o backend Express simultaneamente |
| `npm run build:apk`       | Gera o APK em `/apk/bar.apk`                          |
| `npm run limpar:vendas`   | Limpa os dados de vendas                              |
| `npm run set:config`      | Define o IP fixo (executar apenas uma vez)            |
| `npm run sync:operadores` | Sincroniza operadores quando adicionados no TecBar    |

---

## ⚙️ Configurações Importantes

### Configuração de IP

- Execute `npm run set:config` **apenas uma vez** para definir o IP fixo do servidor.

### Sincronização de Operadores

- Quando um novo operador for adicionado no sistema TecBar, execute `npm run sync:operadores` para sincronizar os dados.

---

> Para dúvidas ou suporte técnico, entre em contato com o desenvolvedor responsável.
