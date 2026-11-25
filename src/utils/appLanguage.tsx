import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translateTurkishToEnglish, TranslationMode } from './englishTranslator';

export type AppLanguage = 'tr' | 'en';
export type AppTranslationMode = 'off' | TranslationMode;

interface AppLanguageContextValue {
  lang: AppLanguage;
  setLang: (next: AppLanguage) => void;
  toggleLang: () => void;
  /** True when the user is currently in 2nd Grade Math or an English-compatible Other Game (full translation scope) */
  isEnScopeActive: boolean;
  /** Active DOM translation scope: 'off' (TR), 'titles' (homepage & other grades headings/titles), or 'full' (2nd grade math & eligible games) */
  translationMode: AppTranslationMode;
  /** Effective display language for full-translation screens (2nd Grade Math & eligible Other Games) */
  effectiveLang: AppLanguage;
}

const STORAGE_KEY = 'app_ui_lang_v1';

const readStoredLanguage = (): AppLanguage => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'tr';
    }
  } catch {
    // Ignore storage errors
  }
  return 'tr';
};

let activeAppLanguage: AppLanguage = readStoredLanguage();

/** Synchronously read the current UI language (used by bilingual 2nd-grade question generators). */
export const getAppLanguage = (): AppLanguage => activeAppLanguage;

const AppLanguageContext = createContext<AppLanguageContextValue>({
  lang: 'tr',
  setLang: () => {},
  toggleLang: () => {},
  isEnScopeActive: false,
  translationMode: 'off',
  effectiveLang: 'tr',
});

export const useAppLanguage = () => useContext(AppLanguageContext);

export const AppLanguageProvider: React.FC<{
  isEnScopeActive: boolean;
  translationScope?: TranslationMode;
  children: React.ReactNode;
}> = ({ isEnScopeActive, translationScope, children }) => {
  const [lang, setLangState] = useState<AppLanguage>(() => readStoredLanguage());

  const setLang = (next: AppLanguage) => {
    activeAppLanguage = next;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage quota errors
    }
    try {
      window.dispatchEvent(new CustomEvent('app-lang-changed', { detail: next }));
    } catch {
      // Ignore event dispatch errors
    }
  };

  useEffect(() => {
    activeAppLanguage = lang;
  }, [lang]);

  const toggleLang = () => setLang(lang === 'tr' ? 'en' : 'tr');

  const resolvedScope: TranslationMode = translationScope ?? (isEnScopeActive ? 'full' : 'titles');
  const translationMode: AppTranslationMode = lang === 'en' ? resolvedScope : 'off';
  const effectiveLang: AppLanguage = lang === 'en' && isEnScopeActive ? 'en' : 'tr';

  // Lossless DOM Text-Node Translator with clean mode-aware restoration
  const originalTextMapRef = useRef<WeakMap<Text, { tr: string; lastEn: string; mode: TranslationMode }>>(new WeakMap());
  const trackedNodesRef = useRef<Set<Text>>(new Set());

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const restoreAllNodes = () => {
      trackedNodesRef.current.forEach((node) => {
        const entry = originalTextMapRef.current.get(node);
        if (entry && node.isConnected && node.nodeValue === entry.lastEn) {
          node.nodeValue = entry.tr;
        }
      });
      trackedNodesRef.current.clear();
    };

    if (translationMode === 'off') {
      restoreAllNodes();
      return;
    }

    const activeMode: TranslationMode = translationMode;
    let isApplying = false;

    const shouldSkipNode = (node: Node): boolean => {
      const parent = node.parentElement;
      if (!parent) return true;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'CODE') {
        return true;
      }
      if (parent.closest('[data-no-translate="true"]')) {
        return true;
      }
      return false;
    };

    const translateTextNode = (textNode: Text) => {
      if (shouldSkipNode(textNode)) return;
      const current = textNode.nodeValue;
      if (!current || !current.trim()) return;

      const existing = originalTextMapRef.current.get(textNode);
      if (existing && current === existing.lastEn && existing.mode === activeMode) {
        return; // Already translated for this mode
      }

      const sourceTr = existing && current === existing.lastEn ? existing.tr : current;
      const translated = translateTurkishToEnglish(sourceTr, activeMode);

      if (translated !== sourceTr) {
        originalTextMapRef.current.set(textNode, { tr: sourceTr, lastEn: translated, mode: activeMode });
        trackedNodesRef.current.add(textNode);
        if (textNode.nodeValue !== translated) {
          textNode.nodeValue = translated;
        }
      } else if (existing && current === existing.lastEn) {
        // Restore to TR if the new mode does not translate this node
        textNode.nodeValue = sourceTr;
        trackedNodesRef.current.delete(textNode);
      }
    };

    const walkAndTranslate = (target: Node) => {
      if (target.nodeType === Node.TEXT_NODE) {
        translateTextNode(target as Text);
        return;
      }
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        translateTextNode(n as Text);
        n = walker.nextNode();
      }
    };

    isApplying = true;
    walkAndTranslate(root);
    isApplying = false;

    const observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      isApplying = true;
      try {
        for (const m of mutations) {
          if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
            translateTextNode(m.target as Text);
          } else if (m.type === 'childList') {
            m.addedNodes.forEach((added) => walkAndTranslate(added));
          }
        }
      } finally {
        isApplying = false;
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      restoreAllNodes();
    };
  }, [translationMode]);

  return (
    <AppLanguageContext.Provider value={{ lang, setLang, toggleLang, isEnScopeActive, translationMode, effectiveLang }}>
      {children}
    </AppLanguageContext.Provider>
  );
};
