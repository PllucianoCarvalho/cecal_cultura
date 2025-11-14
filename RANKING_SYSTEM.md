# Sistema de Ranking Global 🏆

## Visão Geral
O sistema de ranking foi atualizado para funcionar globalmente, permitindo que jogadores vejam e compitam no ranking mesmo usando dispositivos diferentes.

## Como Funciona

### 🌐 Ranking Global
- **Online**: Scores são salvos em um banco de dados online (JSONBin.io)
- **Offline**: Funciona localmente usando localStorage como fallback
- **Sincronização**: Automaticamente detecta conexão e muda entre modos

### 📊 Sistema de Pontuação
```
Pontos = (Nível × 100) + (Palavras Corretas × 10)
```

### 🔄 Funcionalidades
- **Top 50 Global**: Melhores jogadores do mundo
- **Top 10 Local**: Backup local para modo offline
- **Auto-detecção**: Muda automaticamente entre online/offline
- **Loading Visual**: Indicador de carregamento com animação
- **Fallback Inteligente**: Sempre funciona, mesmo sem internet

## Indicadores Visuais

### Status de Conexão
- 🌐 **Online**: "Ranking Global" - conectado à internet
- 📱 **Offline**: "Ranking Local" - usando dados locais

### Estados do Ranking
- ⏳ **Carregando**: Animação durante busca de dados
- 🏆 **Top 3**: Destaque especial para os 3 melhores
- 📋 **Lista Completa**: Até 20 posições mostradas

## Tecnologias Utilizadas

### API Externa
- **JSONBin.io**: Armazenamento gratuito de JSON
- **REST API**: Endpoints PUT/GET para dados
- **Chave API**: Autenticação segura

### JavaScript Moderno
- **Async/await**: Operações assíncronas
- **Fetch API**: Requisições HTTP
- **localStorage**: Backup offline
- **Event Listeners**: Detecção online/offline

### Experiência do Usuário
- **Progressive Enhancement**: Funciona sempre
- **Graceful Degradation**: Falha silenciosa para local
- **Visual Feedback**: Indicadores de estado
- **Responsive**: Funciona em todos os dispositivos

## Estrutura de Dados

### Score Object
```json
{
  "name": "Player Name",
  "level": 5,
  "wordsCorrect": 23,
  "points": 730,
  "date": "25/12/2024",
  "timestamp": 1735123456789
}
```

### Database Structure
```json
{
  "scores": [
    { "name": "João", "level": 8, "points": 950, ... },
    { "name": "Maria", "level": 7, "points": 880, ... }
  ]
}
```

## Fluxo de Funcionamento

1. **Salvar Score**
   - Salva localmente primeiro (garantia)
   - Verifica conexão online
   - Se online: busca ranking atual
   - Adiciona novo score
   - Ordena e limita a 50
   - Salva no servidor

2. **Mostrar Ranking**
   - Verifica status da conexão
   - Se online: busca dados do servidor
   - Se offline ou erro: usa dados locais
   - Exibe com indicador de estado

3. **Tratamento de Erros**
   - Timeout de conexão
   - Falhas de API
   - Dados corrompidos
   - Sempre mantém funcionalidade básica

## Vantagens

### Para os Jogadores
- 🌍 **Competição Global**: Jogue contra o mundo
- 📱 **Funciona Sempre**: Online ou offline
- 🔄 **Sincronização**: Dados sempre atualizados
- 🏆 **Rankings Justos**: Sistema de pontuação balanceado

### Para o Desenvolvimento
- 🔧 **Fácil Manutenção**: API externa gerenciada
- 💰 **Custo Zero**: Serviço gratuito
- 🚀 **Deploy Simples**: Funciona no GitHub Pages
- 🛡️ **Fallback Robusto**: Nunca quebra completamente

## Configuração Técnica

### API Settings
```javascript
const RANKING_API_URL = 'https://api.jsonbin.io/v3/b/673607bae41b4d34e4534a2b';
const API_KEY = '$2a$10$8K9Zx.YvQ5pN2mR4jL6wGOqF3tH7sE1dV9bC8aX5nM0kJ2iP6uQ4r';
```

### Headers Required
```javascript
{
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY
}
```

### Endpoints
- **GET** `/latest` - Buscar dados atuais
- **PUT** `/` - Atualizar dados completos

## Status de Implementação

✅ **Implementado**
- Sistema de ranking global
- Fallback para modo offline
- Detecção automática de conexão
- Interface visual com indicadores
- Tratamento robusto de erros

🔮 **Futuras Melhorias**
- Cache inteligente de dados
- Sincronização em background
- Estatísticas detalhadas por jogador
- Sistema de conquistas
- Ranking por regiões

## Suporte e Compatibilidade

### Navegadores
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Dispositivos
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile
- ✅ Todos os tamanhos de tela

### Conectividade
- ✅ Wi-Fi
- ✅ Dados móveis
- ✅ Conexões instáveis
- ✅ Modo offline completo