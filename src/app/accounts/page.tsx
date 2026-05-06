'use client';

import { useEffect, useState } from 'react';
import { loadAccounts, saveAccounts } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import type { BankAccount } from '@/lib/types';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

const accountTypes = [
  { value: 'checking', labelZh: '支票账户', label: 'Checking' },
  { value: 'savings', labelZh: '储蓄账户', label: 'Savings' },
  { value: 'brokerage', labelZh: '经纪账户', label: 'Brokerage' },
  { value: 'retirement', labelZh: '退休账户', label: 'Retirement' },
  { value: 'credit_card', labelZh: '信用卡', label: 'Credit Card' },
];

export default function AccountsPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [institution, setInstitution] = useState('');
  const [accountType, setAccountType] = useState<BankAccount['accountType']>('checking');
  const [balance, setBalance] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setAccounts(loadAccounts());
  }, []);

  const resetForm = () => {
    setInstitution('');
    setAccountType('checking');
    setBalance('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (account: BankAccount) => {
    setInstitution(account.institution);
    setAccountType(account.accountType);
    setBalance(account.balance.toString());
    setNotes(account.notes);
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const account: BankAccount = {
      id: editingId || crypto.randomUUID(),
      institution: institution.trim(),
      accountType,
      balance: parseFloat(balance) || 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      notes,
    };

    let updated: BankAccount[];
    if (editingId) {
      updated = accounts.map((a) => (a.id === editingId ? account : a));
    } else {
      updated = [...accounts, account];
    }
    saveAccounts(updated);
    setAccounts(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('确认删除该账户？')) return;
    const updated = accounts.filter((a) => a.id !== id);
    saveAccounts(updated);
    setAccounts(updated);
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">银行账户</h2>
          <p className="text-sm text-slate-500 mt-1">Bank Accounts - 金融账户管理</p>
        </div>
        {isAdmin && !showForm && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + 手动添加账户
            </button>
          </div>
        )}
      </div>

      {/* Plaid Placeholder */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl">
            &#x1F3E6;
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">银行账户自动同步 / Bank Account Sync</h3>
            <p className="text-xs text-slate-500 mt-1">
              Plaid 集成即将推出 - 自动连接您的银行、券商和信用卡账户
            </p>
            <p className="text-xs text-slate-400">
              Plaid integration coming soon - auto-connect your bank, brokerage, and credit card accounts
            </p>
          </div>
          <button disabled className="px-4 py-2 bg-slate-300 text-white rounded-lg text-sm font-medium cursor-not-allowed">
            即将推出
          </button>
        </div>
      </div>

      {/* Tax Document Upload Placeholder */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xl">
            &#x1F4C4;
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">税务文件导入 / Import Tax Documents</h3>
            <p className="text-xs text-slate-500 mt-1">
              上传 W-2、1099 等税务文件，自动解析收入和资产信息
            </p>
          </div>
          <button disabled className="px-4 py-2 bg-slate-300 text-white rounded-lg text-sm font-medium cursor-not-allowed">
            即将推出
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? '编辑账户 / Edit Account' : '添加账户 / Add Account'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                机构名称 <span className="text-xs text-slate-400">Institution</span>
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Chase / Fidelity / Schwab"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                账户类型 <span className="text-xs text-slate-400">Account Type</span>
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as BankAccount['accountType'])}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accountTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.labelZh} / {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                当前余额 <span className="text-xs text-slate-400">Current Balance ($)</span>
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                备注 <span className="text-xs text-slate-400">Notes</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="可选 / Optional"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={resetForm}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
              取消 / Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editingId ? '保存 / Save' : '添加 / Add'}
            </button>
          </div>
        </form>
      )}

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">已连接账户 / Connected Accounts</h3>
            <span className="text-lg font-bold text-blue-600">总计: {fmt(totalBalance)}</span>
          </div>
          <div className="space-y-3">
            {accounts.map((account) => {
              const typeInfo = accountTypes.find((t) => t.value === account.accountType);
              return (
                <div key={account.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {account.institution.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{account.institution}</p>
                      <p className="text-xs text-slate-400">
                        {typeInfo?.labelZh} / {typeInfo?.label}
                        {account.notes && ` - ${account.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${account.accountType === 'credit_card' ? 'text-red-500' : 'text-slate-800'}`}>
                        {fmt(account.balance)}
                      </p>
                      <p className="text-xs text-slate-400">更新: {account.lastUpdated}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(account)}
                          className="px-3 py-1.5 text-xs bg-slate-200 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                          编辑
                        </button>
                        <button onClick={() => handleDelete(account.id)}
                          className="px-3 py-1.5 text-xs bg-slate-200 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600">
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">&#x1F3E6;</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">暂无账户</h3>
          <p className="text-sm text-slate-500">No accounts yet. Add your first financial account manually.</p>
        </div>
      )}
    </div>
  );
}
