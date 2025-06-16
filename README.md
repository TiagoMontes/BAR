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

### 3. Gerar APK de Instalação

```bash
npm run generate:config
```

> Isso irá gerar o arquivo `bar.apk` em `./apk`.

### 4. Transferir o APK para o Dispositivo

- Envie o arquivo `apk/bar.apk` para o Google Drive.
- Acesse o Google Drive no dispositivo Android.
- Baixe e instale o APK (permitir instalações externas, se necessário).

### 5. Conectar Todos os Dispositivos à Mesma Rede

- O **dispositivo Android** e o **computador com o servidor** devem estar conectados na mesma rede Wi-Fi (intranet).

### 6. Iniciar o Projeto

```bash
npm run dev:all
```

> Isso inicia o frontend Next.js e o backend Express juntos.

### 7. Acessar a Aplicação no Dispositivo

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

| Comando                  | Descrição                                                    |
|--------------------------|--------------------------------------------------------------|
| `npm run dev`            | Inicia apenas o frontend Next.js                             |
| `npm run start`          | Inicia aplicação já compilada                                |
| `npm run generate:config`| Gera o arquivo de configuração antes de buildar              |
| `npm run build:dev:apk`  | Gera o APK para testes com config atual                      |
| `npm run dev:all`        | Inicia o frontend e o backend Express simultaneamente        |
| `npm run build:apk`      | Gera o APK em `/apk/bar.apk`                                 |

---

> Para dúvidas ou suporte técnico, entre em contato com o desenvolvedor responsável.
