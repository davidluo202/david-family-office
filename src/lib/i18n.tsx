'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // Sidebar nav items
  'nav.dashboard': { zh: '仪表盘', en: 'Dashboard' },
  'nav.family': { zh: '家庭成员', en: 'Family Members' },
  'nav.wealth': { zh: '资产负债', en: 'Assets & Liabilities' },
  'nav.portfolio': { zh: '投资持仓', en: 'Portfolio' },
  'nav.analytics': { zh: '趋势分析', en: 'Analytics' },
  'nav.expenses': { zh: '收支管理', en: 'Income & Expenses' },
  'nav.accounts': { zh: '银行账户', en: 'Bank Accounts' },
  'nav.integrations': { zh: '银行/税表接口', en: 'Bank & Tax Data' },
  'nav.goals': { zh: '目标', en: 'Goals' },
  'nav.advisor': { zh: 'AI 顾问', en: 'AI Advisor' },
  'nav.settings': { zh: '设置', en: 'Settings' },

  // Dashboard
  'dashboard.title': { zh: '仪表盘', en: 'Dashboard' },
  'dashboard.subtitle': { zh: '家庭财务总览', en: 'Family Financial Overview' },
  'dashboard.welcome': { zh: '欢迎来到 Mini Family Office', en: 'Welcome to Mini Family Office' },
  'dashboard.welcomeDesc': { zh: '开始添加家庭成员、资产和支出信息，构建您的家庭财务全景。', en: 'Start by adding family members, assets, and expenses to build your family financial overview.' },
  'dashboard.addMembers': { zh: '添加家庭成员', en: 'Add Family Members' },
  'dashboard.manageAssets': { zh: '管理资产', en: 'Manage Assets' },

  // Stat cards
  'stat.netWorth': { zh: '净资产', en: 'Net Worth' },
  'stat.monthlyCashFlow': { zh: '月度现金流', en: 'Monthly Cash Flow' },
  'stat.totalAssets': { zh: '总资产', en: 'Total Assets' },
  'stat.familyMembers': { zh: '家庭成员', en: 'Family Members' },
  'stat.savingsRate': { zh: '储蓄率', en: 'Savings Rate' },
  'stat.adults': { zh: '成人', en: 'Adults' },
  'stat.children': { zh: '子女', en: 'Children' },

  // Sections
  'section.portfolio': { zh: '投资组合', en: 'Portfolio' },
  'section.viewDetails': { zh: '查看详情', en: 'View Details' },
  'section.assets': { zh: '资产概况', en: 'Assets Overview' },
  'section.goals': { zh: '目标进度', en: 'Goals Progress' },
  'section.expenses': { zh: '月度支出', en: 'Monthly Expenses' },
  'section.family': { zh: '家庭成员', en: 'Family Members' },
  'section.total': { zh: '总计', en: 'Total' },
  'section.monthlyTotal': { zh: '月度总计', en: 'Monthly Total' },

  // Empty states
  'empty.noAssets': { zh: '暂无资产数据', en: 'No asset data yet' },
  'empty.addAssets': { zh: '添加资产', en: 'Add Assets' },
  'empty.noGoals': { zh: '暂无目标', en: 'No goals yet' },
  'empty.setGoals': { zh: '设置目标', en: 'Set Goals' },
  'empty.noExpenses': { zh: '暂无支出数据', en: 'No expense data yet' },
  'empty.addExpenses': { zh: '录入支出', en: 'Add Expenses' },

  // Common
  'common.logout': { zh: '退出', en: 'Logout' },
  'common.admin': { zh: '管理员', en: 'Admin' },
  'common.member': { zh: '成员', en: 'Member' },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'zh',
  setLang: () => {},
  t: (key: string) => key,
});

const STORAGE_KEY = 'mfo-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
