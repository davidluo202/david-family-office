'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { assets, liabilities, netWorthHistory } from '@/data/mockData';
import { getNetWorth, getTotalAssets, getTotalLiabilities } from '@/lib/healthScore';

function fmt(v: number) {
  return `$${v.toLocaleString()}`;
}

export default function WealthPage() {
  const totalAssets = getTotalAssets();
  const totalLiabilities = getTotalLiabilities();
  const netWorth = getNetWorth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Wealth Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Net worth, assets, and liabilities breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{fmt(totalAssets)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Total Liabilities</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{fmt(totalLiabilities)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Net Worth</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{fmt(netWorth)}</p>
        </div>
      </div>

      {/* Net Worth Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Net Worth Trend (12 Months)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={netWorthHistory} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                domain={['dataMin - 50000', 'dataMax + 50000']}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Net Worth']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Assets Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Assets Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-500 font-medium pb-2">Category</th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2">Value</th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(assets).map(([key, asset]) => (
                <tr key={key} className="border-b border-slate-50">
                  <td className="py-3">
                    <p className="text-sm font-medium text-slate-700">{asset.label}</p>
                    {'breakdown' in asset && asset.breakdown && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(asset.breakdown).map(([subKey, subVal]) => (
                          <p key={subKey} className="text-xs text-slate-400 pl-4">
                            {subKey.replace('_', ' ')}: ${(subVal as number).toLocaleString()}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="text-right text-sm font-medium text-slate-700 align-top py-3">
                    {fmt(asset.value)}
                  </td>
                  <td className="text-right text-sm text-slate-400 align-top py-3">
                    {Math.round((asset.value / totalAssets) * 100)}%
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-3 text-sm text-slate-800">Total Assets</td>
                <td className="text-right py-3 text-sm text-green-600">{fmt(totalAssets)}</td>
                <td className="text-right py-3 text-sm text-slate-400">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Liabilities Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Liabilities Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-500 font-medium pb-2">Category</th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2">Balance</th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(liabilities).map(([key, liability]) => (
                <tr key={key} className="border-b border-slate-50">
                  <td className="py-3 text-sm font-medium text-slate-700">{liability.label}</td>
                  <td className="text-right text-sm font-medium text-red-500 py-3">{fmt(liability.value)}</td>
                  <td className="text-right text-sm text-slate-400 py-3">
                    {Math.round((liability.value / totalLiabilities) * 100)}%
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-3 text-sm text-slate-800">Total Liabilities</td>
                <td className="text-right py-3 text-sm text-red-600">{fmt(totalLiabilities)}</td>
                <td className="text-right py-3 text-sm text-slate-400">100%</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Debt-to-Asset Ratio</span>
              <span className="text-lg font-bold text-blue-600">
                {(totalLiabilities / totalAssets * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
