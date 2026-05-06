'use client';

import { useEffect, useState } from 'react';
import { loadAssets, loadLiabilities, saveAssets, saveLiabilities } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import type { Asset, Liability } from '@/lib/types';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

const assetCategories = [
  { value: 'cash', labelZh: '现金/储蓄', label: 'Cash & Savings' },
  { value: 'investment', labelZh: '投资组合', label: 'Investments' },
  { value: 'retirement', labelZh: '退休账户', label: 'Retirement' },
  { value: 'real_estate', labelZh: '房产', label: 'Real Estate' },
  { value: 'education', labelZh: '教育基金', label: 'Education (529)' },
  { value: 'insurance', labelZh: '保险', label: 'Insurance' },
  { value: 'other', labelZh: '其他', label: 'Other' },
];

const liabilityCategories = [
  { value: 'mortgage', labelZh: '房贷', label: 'Mortgage' },
  { value: 'auto_loan', labelZh: '车贷', label: 'Auto Loan' },
  { value: 'credit_card', labelZh: '信用卡', label: 'Credit Card' },
  { value: 'student_loan', labelZh: '学生贷款', label: 'Student Loan' },
  { value: 'other', labelZh: '其他', label: 'Other' },
];

interface ItemFormProps {
  type: 'asset' | 'liability';
  onSave: (item: Asset | Liability) => void;
  onCancel: () => void;
  editing?: Asset | Liability | null;
}

function ItemForm({ type, onSave, onCancel, editing }: ItemFormProps) {
  const categories = type === 'asset' ? assetCategories : liabilityCategories;
  const [category, setCategory] = useState(editing?.category || categories[0].value);
  const [label, setLabel] = useState(editing?.label || '');
  const [value, setValue] = useState(editing?.value?.toString() || '');
  const notes = editing?.notes || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = {
      id: editing?.id || crypto.randomUUID(),
      category: category as Asset['category'] & Liability['category'],
      label: label.trim() || categories.find((c) => c.value === category)?.labelZh || category,
      value: parseFloat(value) || 0,
      notes,
      updatedAt: new Date().toISOString(),
    };
    onSave(item as Asset & Liability);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <div className="grid grid-cols-4 gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.labelZh} / {c.label}</option>
          ))}
        </select>
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder="名称 / Label" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
          placeholder="金额 / Amount" min="0" step="100" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            {editing ? '保存' : '添加'}
          </button>
          <button type="button" onClick={onCancel} className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
            取消
          </button>
        </div>
      </div>
    </form>
  );
}

export default function WealthPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  useEffect(() => {
    setAssets(loadAssets());
    setLiabilities(loadLiabilities());
  }, []);

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleSaveAsset = (item: Asset) => {
    let updated: Asset[];
    if (editingAsset) {
      updated = assets.map((a) => (a.id === item.id ? item : a));
    } else {
      updated = [...assets, item];
    }
    saveAssets(updated);
    setAssets(updated);
    setShowAssetForm(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    if (!confirm('确认删除？')) return;
    const updated = assets.filter((a) => a.id !== id);
    saveAssets(updated);
    setAssets(updated);
  };

  const handleSaveLiability = (item: Liability) => {
    let updated: Liability[];
    if (editingLiability) {
      updated = liabilities.map((l) => (l.id === item.id ? item : l));
    } else {
      updated = [...liabilities, item];
    }
    saveLiabilities(updated);
    setLiabilities(updated);
    setShowLiabilityForm(false);
    setEditingLiability(null);
  };

  const handleDeleteLiability = (id: string) => {
    if (!confirm('确认删除？')) return;
    const updated = liabilities.filter((l) => l.id !== id);
    saveLiabilities(updated);
    setLiabilities(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">资产负债</h2>
        <p className="text-sm text-slate-500 mt-1">Assets & Liabilities - 净资产概览</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">总资产 / Total Assets</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{fmt(totalAssets)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">总负债 / Total Liabilities</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{fmt(totalLiabilities)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">净资产 / Net Worth</p>
          <p className={`text-3xl font-bold mt-1 ${netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(netWorth)}</p>
        </div>
      </div>

      {totalAssets > 0 && totalLiabilities > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">负债/资产比率 / Debt-to-Asset Ratio</span>
            <span className="text-lg font-bold text-blue-600">
              {(totalLiabilities / totalAssets * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">资产 / Assets</h3>
            {isAdmin && !showAssetForm && (
              <button onClick={() => { setEditingAsset(null); setShowAssetForm(true); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                + 添加资产
              </button>
            )}
          </div>
          {showAssetForm && (
            <div className="mb-4">
              <ItemForm
                type="asset"
                editing={editingAsset}
                onSave={(item) => handleSaveAsset(item as Asset)}
                onCancel={() => { setShowAssetForm(false); setEditingAsset(null); }}
              />
            </div>
          )}
          {assets.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs text-slate-500 font-medium pb-2">类别</th>
                  <th className="text-right text-xs text-slate-500 font-medium pb-2">金额</th>
                  {isAdmin && <th className="text-right text-xs text-slate-500 font-medium pb-2 w-20">操作</th>}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-50">
                    <td className="py-3 text-sm font-medium text-slate-700">{asset.label}</td>
                    <td className="text-right text-sm font-medium text-slate-700 py-3">{fmt(asset.value)}</td>
                    {isAdmin && (
                      <td className="text-right py-3">
                        <button onClick={() => { setEditingAsset(asset); setShowAssetForm(true); }}
                          className="text-xs text-blue-600 hover:text-blue-700 mr-2">编辑</button>
                        <button onClick={() => handleDeleteAsset(asset.id)}
                          className="text-xs text-red-500 hover:text-red-600">删除</button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3 text-sm text-slate-800">总计</td>
                  <td className="text-right py-3 text-sm text-green-600">{fmt(totalAssets)}</td>
                  {isAdmin && <td />}
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">暂无资产数据</p>
              <p className="text-xs text-slate-400">No assets yet</p>
            </div>
          )}
        </div>

        {/* Liabilities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">负债 / Liabilities</h3>
            {isAdmin && !showLiabilityForm && (
              <button onClick={() => { setEditingLiability(null); setShowLiabilityForm(true); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                + 添加负债
              </button>
            )}
          </div>
          {showLiabilityForm && (
            <div className="mb-4">
              <ItemForm
                type="liability"
                editing={editingLiability}
                onSave={(item) => handleSaveLiability(item as Liability)}
                onCancel={() => { setShowLiabilityForm(false); setEditingLiability(null); }}
              />
            </div>
          )}
          {liabilities.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs text-slate-500 font-medium pb-2">类别</th>
                  <th className="text-right text-xs text-slate-500 font-medium pb-2">余额</th>
                  {isAdmin && <th className="text-right text-xs text-slate-500 font-medium pb-2 w-20">操作</th>}
                </tr>
              </thead>
              <tbody>
                {liabilities.map((liability) => (
                  <tr key={liability.id} className="border-b border-slate-50">
                    <td className="py-3 text-sm font-medium text-slate-700">{liability.label}</td>
                    <td className="text-right text-sm font-medium text-red-500 py-3">{fmt(liability.value)}</td>
                    {isAdmin && (
                      <td className="text-right py-3">
                        <button onClick={() => { setEditingLiability(liability); setShowLiabilityForm(true); }}
                          className="text-xs text-blue-600 hover:text-blue-700 mr-2">编辑</button>
                        <button onClick={() => handleDeleteLiability(liability.id)}
                          className="text-xs text-red-500 hover:text-red-600">删除</button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3 text-sm text-slate-800">总计</td>
                  <td className="text-right py-3 text-sm text-red-600">{fmt(totalLiabilities)}</td>
                  {isAdmin && <td />}
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">暂无负债数据</p>
              <p className="text-xs text-slate-400">No liabilities yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
