'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { loadBills, saveBills } from '@/lib/storage';
import type { RecurringBill, BillCategory } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

const CATEGORY_LABELS: Record<BillCategory, { en: string; zh: string }> = {
  credit_card: { en: 'Credit Card', zh: '信用卡' },
  utility: { en: 'Utilities', zh: '水电煤' },
  property_tax: { en: 'Property Tax', zh: '地税' },
  home_insurance: { en: 'Home Insurance', zh: '房屋保险' },
  life_insurance: { en: 'Life Insurance', zh: '人寿保险' },
  subscription: { en: 'Subscription', zh: '订阅' },
  other: { en: 'Other', zh: '其他' },
};

const FREQ_LABELS: Record<string, { en: string; zh: string }> = {
  monthly: { en: 'Monthly', zh: '每月' },
  quarterly: { en: 'Quarterly', zh: '每季' },
  semi_annual: { en: 'Semi-Annual', zh: '半年' },
  annual: { en: 'Annual', zh: '每年' },
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number): string {
  if (days < 0) return 'bg-red-100 text-red-700 border-red-200';
  if (days <= 3) return 'bg-red-50 text-red-600 border-red-200';
  if (days <= 7) return 'bg-orange-50 text-orange-600 border-orange-200';
  if (days <= 14) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

const emptyBill: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', nameZh: '', category: 'other', amount: 0, currency: 'USD',
  frequency: 'monthly', dueDay: 1, nextDueDate: '', autopay: false,
  payee: '', notes: '',
};

export default function BillsPage() {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBill);

  useEffect(() => {
    setBills(loadBills());
  }, []);

  const save = (updated: RecurringBill[]) => {
    setBills(updated);
    saveBills(updated);
  };

  const handleSubmit = () => {
    if (!form.name) return;
    const now = new Date().toISOString();
    if (editingId) {
      save(bills.map(b => b.id === editingId ? { ...b, ...form, updatedAt: now } : b));
    } else {
      const newBill: RecurringBill = {
        ...form,
        id: Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
      };
      save([...bills, newBill]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyBill);
  };

  const handleEdit = (bill: RecurringBill) => {
    setForm(bill);
    setEditingId(bill.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm(isZh ? '确定删除此账单？' : 'Delete this bill?')) return;
    save(bills.filter(b => b.id !== id));
  };

  const handleMarkPaid = (id: string) => {
    const now = new Date().toISOString().split('T')[0];
    save(bills.map(b => {
      if (b.id !== id) return b;
      // Calculate next due date
      const current = new Date(b.nextDueDate);
      const next = new Date(current);
      if (b.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
      else if (b.frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
      else if (b.frequency === 'semi_annual') next.setMonth(next.getMonth() + 6);
      else if (b.frequency === 'annual') next.setFullYear(next.getFullYear() + 1);
      return { ...b, lastPaidDate: now, nextDueDate: next.toISOString().split('T')[0], updatedAt: new Date().toISOString() };
    }));
  };

  // Sort by next due date
  const sorted = [...bills].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  const upcoming = sorted.filter(b => daysUntil(b.nextDueDate) <= 10);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{isZh ? '账单提醒' : 'Bills & Reminders'}</h1>
            <p className="text-sm text-gray-500 mt-1">{isZh ? '管理定期支付的账单，10天内到期提醒' : 'Manage recurring bills with 10-day due date reminders'}</p>
          </div>
          <button onClick={() => { setForm(emptyBill); setEditingId(null); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
            + {isZh ? '添加账单' : 'Add Bill'}
          </button>
        </div>

        {/* Upcoming alerts */}
        {upcoming.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h3 className="font-bold text-orange-800 mb-2">{isZh ? `未来10天内到期 (${upcoming.length})` : `Due within 10 days (${upcoming.length})`}</h3>
            <div className="space-y-2">
              {upcoming.map(bill => {
                const days = daysUntil(bill.nextDueDate);
                return (
                  <div key={bill.id} className={`flex items-center justify-between p-3 rounded-lg border ${urgencyColor(days)}`}>
                    <div>
                      <span className="font-bold">{isZh ? bill.nameZh || bill.name : bill.name}</span>
                      <span className="ml-2 text-xs">({CATEGORY_LABELS[bill.category]?.[isZh ? 'zh' : 'en']})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{bill.currency} {bill.amount.toLocaleString()}</span>
                      <span className="text-sm">
                        {days < 0 ? (isZh ? `逾期${-days}天` : `${-days}d overdue`) :
                         days === 0 ? (isZh ? '今天到期' : 'Due today') :
                         (isZh ? `${days}天后` : `in ${days}d`)}
                      </span>
                      <button onClick={() => handleMarkPaid(bill.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700">
                        {isZh ? '已付' : 'Paid'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All bills */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-500">{isZh ? '账单' : 'Bill'}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{isZh ? '类别' : 'Category'}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">{isZh ? '金额' : 'Amount'}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">{isZh ? '频率' : 'Frequency'}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">{isZh ? '下次到期' : 'Next Due'}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">{isZh ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">{isZh ? '暂无账单' : 'No bills yet'}</td></tr>
              ) : sorted.map(bill => {
                const days = daysUntil(bill.nextDueDate);
                return (
                  <tr key={bill.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{isZh ? bill.nameZh || bill.name : bill.name}</div>
                      {bill.payee && <div className="text-xs text-gray-400">{bill.payee}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">{CATEGORY_LABELS[bill.category]?.[isZh ? 'zh' : 'en']}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">{bill.currency} {bill.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-xs">{FREQ_LABELS[bill.frequency]?.[isZh ? 'zh' : 'en']}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${days <= 10 ? (days < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700') : 'text-gray-600'}`}>
                        {bill.nextDueDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleMarkPaid(bill.id)} className="text-green-600 hover:underline text-xs mr-2">{isZh ? '已付' : 'Paid'}</button>
                      <button onClick={() => handleEdit(bill)} className="text-blue-600 hover:underline text-xs mr-2">{isZh ? '编辑' : 'Edit'}</button>
                      <button onClick={() => handleDelete(bill.id)} className="text-red-500 hover:underline text-xs">{isZh ? '删除' : 'Del'}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">{editingId ? (isZh ? '编辑账单' : 'Edit Bill') : (isZh ? '添加账单' : 'Add Bill')}</h3>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 text-2xl">&times;</button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Name (EN)</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">名称 (ZH)</label>
                    <input value={form.nameZh} onChange={e => setForm({ ...form, nameZh: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '类别' : 'Category'}</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as BillCategory })}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{isZh ? v.zh : v.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '金额' : 'Amount'}</label>
                    <input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '币种' : 'Currency'}</label>
                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="USD">USD</option>
                      <option value="HKD">HKD</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '频率' : 'Frequency'}</label>
                    <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as RecurringBill['frequency'] })}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      {Object.entries(FREQ_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{isZh ? v.zh : v.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '下次到期日' : 'Next Due Date'}</label>
                    <input type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{isZh ? '收款方' : 'Payee'}</label>
                    <input value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.autopay} onChange={e => setForm({ ...form, autopay: e.target.checked })} />
                      <span className="text-sm">{isZh ? '自动扣款' : 'Autopay'}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">{isZh ? '备注' : 'Notes'}</label>
                  <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm">{isZh ? '取消' : 'Cancel'}</button>
                <button onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">{isZh ? '保存' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
