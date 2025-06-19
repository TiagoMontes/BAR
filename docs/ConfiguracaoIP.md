# Configuração de IP - BAR System

Este documento explica como configurar o IP do servidor para diferentes ambientes.

## 🎯 Problema Resolvido

Anteriormente, o IP do servidor estava fixo nos arquivos de configuração, exigindo rebuild da aplicação para mudar de ambiente. Agora temos uma solução dinâmica.

## 📁 Arquivos Afetados

Os seguintes arquivos são gerados automaticamente com o IP correto:

1. **`lib/config.json`** - Configuração do servidor (porta 3001)
2. **`capacitor.config.js`** - Configuração do Capacitor (porta 3000)
3. **`android/app/src/main/assets/capacitor.config.json`** - Configuração Android

## 🚀 Scripts Disponíveis

### 1. **Geração Automática (IP Local)**

```bash
npm run generate:config
```

- Detecta automaticamente o IP da máquina
- Gera todos os arquivos de configuração
- Usado durante o desenvolvimento

### 2. **Configuração Manual (IP Específico)**

```bash
npm run set:config <IP>
```

- Permite definir um IP específico
- Valida o formato do IP
- Exemplo: `npm run set:config 192.168.1.100`

### 3. **Build Completo**

```bash
npm run build
```

- Executa `generate:config` automaticamente
- Faz o build da aplicação Next.js
- Gera os arquivos estáticos

## 📋 Fluxo de Trabalho

### Para Desenvolvimento Local:

```bash
npm run generate:config  # Detecta IP automaticamente
npm run dev              # Inicia servidor de desenvolvimento
```

### Para Produção/Deploy:

```bash
npm run set:config 192.168.1.100  # Define IP do servidor
npm run build                      # Build da aplicação
npm run cap:sync                   # Sincroniza com Android
npm run build:apk                  # Gera APK
```

### Para Novo Ambiente:

1. Descubra o IP da máquina servidor
2. Execute: `npm run set:config <IP_DO_SERVIDOR>`
3. Execute: `npm run build:apk`
4. Instale o APK gerado

## 🔧 Detalhes Técnicos

### Portas Utilizadas:

- **Porta 3000**: Servidor de desenvolvimento Next.js
- **Porta 3001**: Servidor backend (API)

### Validação de IP:

- Formato: `xxx.xxx.xxx.xxx`
- Validação regex incluída
- Erro se IP inválido

### Logs de Saída:

```
✅ Configurações geradas com IP: 192.168.1.100
📁 lib/config.json: http://192.168.1.100:3001
📁 capacitor.config.js: http://192.168.1.100:3000
📁 android/app/src/main/assets/capacitor.config.json: http://192.168.1.100:3000
```

## 🎯 Vantagens da Nova Solução

1. **Flexibilidade**: IP configurável sem rebuild
2. **Automação**: Detecção automática do IP local
3. **Validação**: Verificação de formato de IP
4. **Consistência**: Todos os arquivos sincronizados
5. **Simplicidade**: Comandos simples e intuitivos

## 🚨 Importante

- Sempre execute `npm run cap:sync` após mudar a configuração
- O APK gerado terá o IP configurado "hardcoded"
- Para mudar o IP, gere um novo APK
- A configuração dinâmica na interface só funciona no navegador

## 🔄 Migração

Se você tem configurações antigas:

1. Delete os arquivos de configuração existentes
2. Execute `npm run generate:config`
3. Verifique se os IPs estão corretos
4. Faça o build novamente

## 📞 Suporte

Em caso de problemas:

1. Verifique se o IP está correto
2. Confirme se as portas estão abertas
3. Teste a conectividade: `ping <IP>`
4. Verifique os logs do servidor
