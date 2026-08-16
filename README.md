# ISPilot AI

Você é um Product Designer Senior, UX/UI Designer, Software Architect e Desenvolvedor Full Stack especializado em sistemas SaaS B2B.

Sua missão é criar um MVP extremamente profissional chamado ISPilot.

O ISPilot é um sistema SaaS de inteligência operacional para provedores de internet (ISPs).

O objetivo NÃO é substituir o ERP do provedor.

O objetivo é funcionar como um copiloto inteligente para equipes de atendimento, suporte técnico, NOC, vendas e gestão.

O sistema deve possuir aparência premium, moderna, minimalista e inspirada em produtos como Linear, Stripe Dashboard, Vercel, Notion, Cursor IDE e OpenAI.

O design deve transmitir confiança, tecnologia e alta performance.

Utilize Dark Mode como padrão.

Paleta:

- Preto (#09090B)

- Cinza Escuro

- Azul moderno

- Branco

- Verde apenas para indicadores positivos

- Vermelho apenas para alertas

Jamais utilizar aparência genérica.

O sistema precisa parecer um software que custa milhares de reais por mês.

===================================

TIPO

Sistema SaaS

Responsivo

Desktop First

Arquitetura preparada para múltiplos provedores (Multi Tenant)

Cada provedor terá seu próprio ambiente.

===================================

LOGIN

Criar tela moderna contendo:

Logo

Nome ISPilot

Campo Email

Campo Senha

Entrar

Lembrar login

Esqueci minha senha

Entrar com Google

Animações suaves

Glassmorphism discreto

===================================

DASHBOARD

Após login mostrar:

Resumo Geral

Cards:

Clientes Atendidos Hoje

Chamados

Tempo Médio Atendimento

Taxa de Resolução

Satisfação

Uso da IA

Economia de Tempo

Gráfico de chamados

Gráfico de utilização da IA

Histórico

Atividades recentes

Menu lateral fixo.

===================================

MENU

Dashboard

Assistente IA

Base de Conhecimento

Diagnóstico

Conversas

Relatórios

Equipe

Integrações

Configurações

Perfil

===================================

MÓDULO IA

Criar um chat semelhante ao ChatGPT.

Campo de mensagem.

Botão enviar.

Botão anexar imagem.

Botão anexar arquivos.

Histórico lateral.

Favoritos.

Respostas em Markdown.

Código.

Blocos.

Tabela.

Links.

Respostas rápidas.

Sugestões automáticas.

===================================

A IA será especializada em provedores.

Ela deverá responder assuntos como:

PPPoE

OLT

ONU

GPON

EPON

Mikrotik

Huawei

FiberHome

ZTE

Datacom

CGNAT

NAT

VLAN

LOS

LOF

DYING GASP

RX

TX

Potência óptica

ONU Offline

Cliente sem internet

Cliente lento

Wi-Fi

Mesh

IPv4

IPv6

Roteadores

UniTV

BTV

Teste velocidade

Cabeamento

RJ45

ONU Bridge

ONU Router

Provisionamento

Sinal óptico

Configuração

Diagnóstico

Boas práticas

Scripts de atendimento

Fluxos internos

===================================

DIAGNÓSTICO

Criar tela onde o usuário informa:

Modelo ONU

OLT

Potência RX

Potência TX

Status LOS

Status PON

Plano

Descrição do cliente

Após clicar em Diagnosticar

A IA gera:

Possíveis causas

Nível de confiança

Checklist

Próximos passos

Tempo estimado

Prioridade

===================================

BASE DE CONHECIMENTO

Sistema parecido com Notion.

Categorias.

Pesquisa instantânea.

Artigos.

Favoritos.

Tags.

===================================

RELATÓRIOS

Quantidade de perguntas feitas.

Tempo economizado.

Assuntos mais pesquisados.

Atendentes que mais utilizam.

Gráficos.

Filtros.

Exportação PDF.

===================================

CONFIGURAÇÕES

Empresa

Usuários

Permissões

API Keys

Integrações

Tema

Notificações

===================================

PERFIL

Foto

Cargo

Empresa

Telefone

Email

Alterar senha

===================================

IA

A arquitetura deve permitir conexão futura com:

OpenAI

Anthropic

Google Gemini

OpenRouter

Modelos locais

O sistema NÃO deve ficar preso a um único provedor de IA.

Criar camada de abstração.

===================================

BANCO DE DADOS

Preparar estrutura para:

Empresas

Usuários

Conversas

Mensagens

Categorias

Artigos

Diagnósticos

Favoritos

Logs

Permissões

===================================

SEGURANÇA

JWT

Controle por tenant

Permissões

Logs

Proteção contra acesso cruzado entre empresas

===================================

UX

Todas as telas devem possuir:

Skeleton Loading

Estados vazios

Estados de erro

Tooltips

Animações suaves

Feedback visual

===================================

PERFORMANCE

Lazy Loading

Componentização

Arquitetura escalável

Código limpo

===================================

TECNOLOGIAS

React

TypeScript

TailwindCSS

Shadcn UI

React Router

React Query

Supabase

PostgreSQL

Framer Motion

React Hook Form

Zod

===================================

OBJETIVO

Criar um MVP extremamente profissional, escalável e preparado para se tornar referência no mercado de provedores de internet.

A prioridade é entregar uma experiência premium e transmitir a sensação de um software enterprise, mesmo antes da implementação completa das integrações e funcionalidades avançadas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0238293a-1064-492f-9879-bb28cf80a2ab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
