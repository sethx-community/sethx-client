import { SupportedLanguage } from './language.service';

export type TranslationKey =
  | 'nav.home'
  | 'nav.exchange'
  | 'nav.docs'
  | 'nav.fees'
  | 'nav.risk'
  | 'nav.community'
  | 'nav.governance'
  | 'nav.protocol'
  | 'nav.app'
  | 'footer.experimental'
  | 'footer.disclaimer'
  | 'footer.risk'
  | 'footer.privacy'
  | 'footer.cookies'
  | 'footer.protocol'
  | 'footer.governance'
  | 'consent.title'
  | 'consent.body'
  | 'consent.decline'
  | 'consent.accept'
  | 'country.kicker'
  | 'country.title'
  | 'country.body'
  | 'country.detected'
  | 'assistant.title'
  | 'assistant.subtitle'
  | 'assistant.placeholder'
  | 'assistant.send';

export const TRANSLATIONS: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.exchange': 'Exchange',
    'nav.docs': 'Library',
    'nav.fees': 'Fees',
    'nav.risk': 'Risk',
    'nav.community': 'Community',
    'nav.governance': 'Governance',
    'nav.protocol': 'Protocol',
    'nav.app': 'Enter app',
    'footer.experimental': 'SETHX.COM is a wallet-connected app for supported smart contracts of the SETHX protocol.',
    'footer.disclaimer': 'Sethx.com is not a custodian, broker, or centralized exchange. It does not sell crypto, provide fiat ramps, or provide financial advice. Trading digital assets and derivatives involves risk. Availability depends on jurisdiction, wallet permissions, and smart contract rules.',
    'footer.risk': 'Risk',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookies',
    'footer.protocol': 'Protocol',
    'footer.governance': 'Governance',
    'consent.title': 'Privacy and analytics',
    'consent.body': 'SETHX uses local browser storage for functional preferences such as language and your analytics choice. If approved, Google Analytics measures page views, Enter App, and wallet connection conversion only. We do not send wallet addresses, selected accounts, balances, orders, transactions, idea text, issue text, advertising identifiers, or commercial tracking data. Analytics may report approximate region/country in aggregated form.',
    'consent.decline': 'Decline analytics',
    'consent.accept': 'Approve analytics',
    'country.kicker': 'Access restricted',
    'country.title': 'SETHX is not available in your region.',
    'country.body': 'This public app is designed to comply with a configurable country blacklist. The final production list should be maintained with legal guidance and enforced by backend/API infrastructure as well as the client.',
    'country.detected': 'Detected country code:',
    'assistant.title': 'Platform assistant',
    'assistant.subtitle': 'Protocol knowledge, live data hooks, risk education, and governance help.',
    'assistant.placeholder': 'Ask about SETHX...',
    'assistant.send': 'Send',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.exchange': 'Exchange',
    'nav.docs': 'Biblioteca',
    'nav.fees': 'Tarifas',
    'nav.risk': 'Riesgo',
    'nav.community': 'Comunidad',
    'nav.governance': 'Gobernanza',
    'nav.protocol': 'Protocolo',
    'nav.app': 'Entrar app',
    'footer.experimental': 'SETHX.COM es una app conectada a wallet para interactuar con smart contracts compatibles del protocolo SETHX.',
    'footer.disclaimer': 'Sethx.com no es custodio, broker ni exchange centralizado. No vende cripto, no ofrece rampas fiat y no proporciona asesoramiento financiero. Operar activos digitales y derivados implica riesgo. La disponibilidad depende de la jurisdicción, permisos de wallet y reglas de smart contracts.',
    'footer.risk': 'Riesgo',
    'footer.privacy': 'Privacidad',
    'footer.cookies': 'Cookies',
    'footer.protocol': 'Protocolo',
    'footer.governance': 'Gobernanza',
    'consent.title': 'Privacidad y analítica',
    'consent.body': 'SETHX usa almacenamiento local del navegador para preferencias funcionales como el idioma y tu elección de analítica. Si lo apruebas, Google Analytics mide solo páginas vistas, Entrar app y conversión de conexión de wallet. No enviamos direcciones de wallet, cuentas seleccionadas, saldos, órdenes, transacciones, textos de ideas o issues, identificadores publicitarios ni datos de seguimiento comercial. La analítica puede mostrar región/país aproximado de forma agregada.',
    'consent.decline': 'Rechazar analítica',
    'consent.accept': 'Aprobar analítica',
    'country.kicker': 'Acceso restringido',
    'country.title': 'SETHX no está disponible en tu región.',
    'country.body': 'Esta app pública está diseñada para cumplir con una lista configurable de países bloqueados. La lista final de producción debe mantenerse con orientación legal y aplicarse también mediante infraestructura backend/API y el cliente.',
    'country.detected': 'Código de país detectado:',
    'assistant.title': 'Asistente de plataforma',
    'assistant.subtitle': 'Conocimiento del protocolo, datos en vivo, educación de riesgo y ayuda de gobernanza.',
    'assistant.placeholder': 'Pregunta sobre SETHX...',
    'assistant.send': 'Enviar',
  },
  pt: {
    'nav.home': 'Início',
    'nav.exchange': 'Exchange',
    'nav.docs': 'Biblioteca',
    'nav.fees': 'Taxas',
    'nav.risk': 'Risco',
    'nav.community': 'Comunidade',
    'nav.governance': 'Governança',
    'nav.protocol': 'Protocolo',
    'nav.app': 'Entrar app',
    'footer.experimental': 'SETHX.COM é um app conectado a wallet para interagir com smart contracts compatíveis do protocolo SETHX.',
    'footer.disclaimer': 'Sethx.com não é custodiante, corretora nem exchange centralizada. Não vende cripto, não oferece rampas fiat e não fornece aconselhamento financeiro. Negociar ativos digitais e derivativos envolve risco. A disponibilidade depende da jurisdição, permissões da wallet e regras dos smart contracts.',
    'footer.risk': 'Risco',
    'footer.privacy': 'Privacidade',
    'footer.cookies': 'Cookies',
    'footer.protocol': 'Protocolo',
    'footer.governance': 'Governança',
    'consent.title': 'Privacidade e analytics',
    'consent.body': 'A SETHX usa armazenamento local do navegador para preferências funcionais, como idioma e sua escolha de analytics. Se aprovado, o Google Analytics mede apenas visualizações de página, Entrar app e conversão de conexão de wallet. Não enviamos endereços de wallet, contas selecionadas, saldos, ordens, transações, textos de ideias ou issues, identificadores de publicidade nem dados de rastreamento comercial. A analytics pode mostrar região/país aproximado de forma agregada.',
    'consent.decline': 'Recusar analytics',
    'consent.accept': 'Aprovar analytics',
    'country.kicker': 'Acesso restrito',
    'country.title': 'SETHX não está disponível na sua região.',
    'country.body': 'Este app público foi projetado para cumprir uma lista configurável de países bloqueados. A lista final de produção deve ser mantida com orientação jurídica e aplicada também pela infraestrutura backend/API e pelo cliente.',
    'country.detected': 'Código do país detectado:',
    'assistant.title': 'Assistente da plataforma',
    'assistant.subtitle': 'Conhecimento do protocolo, dados ao vivo, educação de risco e ajuda de governança.',
    'assistant.placeholder': 'Pergunte sobre SETHX...',
    'assistant.send': 'Enviar',
  },
};
