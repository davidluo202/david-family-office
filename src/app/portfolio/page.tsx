'use client';

import { useEffect, useState } from 'react';
import { robinhoodHoldings, robinhoodCash } from '@/data/mockData';

interface PriceData {
  current: number;
  previousClose: number;
}

type PriceMap = Record<string, PriceData>;

function fmt(v: number) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtPrice(v: number) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(v: number) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function fmtPL(v: number) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function plColor(v: number) {
  if (v > 0) return 'text-green-600';
  if (v < 0) return 'text-red-500';
  return 'text-slate-500';
}

async function fetchPrices(symbols: string[]): Promise<PriceMap> {
  const map: PriceMap = {};
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d`
        );
        if (!res.ok) return;
        const json = await res.json();
        const result = json.chart?.result?.[0];
        if (!result) return;
        const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
        const meta = result.meta;
        const current = meta?.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
        const previousClose = meta?.chartPreviousClose ?? closes[0] ?? current;
        map[symbol] = { current, previousClose };
      } catch {
        // skip failed symbols
      }
    })
  );
  return map;
}

export default function PortfolioPage() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const symbols = robinhoodHoldings.map((h) => h.symbol);
    fetchPrices(symbols)
      .then((pm) => {
        setPrices(pm);
        if (Object.keys(pm).length === 0) {
          setError('Unable to fetch prices from Yahoo Finance');
        }
      })
      .catch(() => setError('Failed to fetch prices'))
      .finally(() => setLoading(false));
  }, []);

  const totalCostBasis = robinhoodHoldings.reduce((s, h) => s + h.costBasis, 0);

  const rows = robinhoodHoldings.map((h) => {
    const p = prices[h.symbol];
    const currentPrice = p?.current ?? 0;
    const previousClose = p?.previousClose ?? 0;
    const marketValue = currentPrice * h.qty;
    const pl = marketValue - h.costBasis;
    const plPct = h.costBasis > 0 ? (pl / h.costBasis) * 100 : 0;
    const dailyChange = (currentPrice - previousClose) * h.qty;
    const dailyChangePct = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
    return { ...h, currentPrice, marketValue, pl, plPct, dailyChange, dailyChangePct };
  });

  const totalMarketValue = rows.reduce((s, r) => s + r.marketValue, 0);
  const totalPL = totalMarketValue - totalCostBasis;
  const totalPLPct = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0;
  const totalDailyChange = rows.reduce((s, r) => s + r.dailyChange, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">投资持仓</h2>
        <p className="text-sm text-slate-500 mt-1">Robinhood Portfolio</p>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-200">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">总市值</p>
          <p className="text-[10px] text-slate-400">Total Market Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {loading ? '...' : fmt(totalMarketValue)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">总成本</p>
          <p className="text-[10px] text-slate-400">Total Cost Basis</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{fmt(totalCostBasis)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">未实现盈亏</p>
          <p className="text-[10px] text-slate-400">Unrealized P&amp;L</p>
          <p className={`text-2xl font-bold mt-1 ${plColor(totalPL)}`}>
            {loading ? '...' : `${fmtPL(totalPL)} (${fmtPct(totalPLPct)})`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">现金余额</p>
          <p className="text-[10px] text-slate-400">Cash Balance</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{fmt(robinhoodCash)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">日涨跌</p>
          <p className="text-[10px] text-slate-400">Daily Change</p>
          <p className={`text-2xl font-bold mt-1 ${plColor(totalDailyChange)}`}>
            {loading ? '...' : fmtPL(totalDailyChange)}
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">持仓明细 / Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 font-medium">
                <th className="text-left px-4 py-3">代码</th>
                <th className="text-left px-4 py-3">名称</th>
                <th className="text-left px-4 py-3">类别</th>
                <th className="text-right px-4 py-3">数量</th>
                <th className="text-right px-4 py-3">均价</th>
                <th className="text-right px-4 py-3">成本</th>
                <th className="text-right px-4 py-3">现价</th>
                <th className="text-right px-4 py-3">市值</th>
                <th className="text-right px-4 py-3">盈亏 ($)</th>
                <th className="text-right px-4 py-3">盈亏 (%)</th>
                <th className="text-right px-4 py-3">日涨跌</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.symbol} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{r.symbol}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">
                    {Number.isInteger(r.qty) ? r.qty : r.qty.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">{fmtPrice(r.avgCost)}</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">{fmt(r.costBasis)}</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">
                    {loading ? '...' : fmtPrice(r.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">
                    {loading ? '...' : fmt(r.marketValue)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${plColor(r.pl)}`}>
                    {loading ? '...' : fmtPL(r.pl)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${plColor(r.plPct)}`}>
                    {loading ? '...' : fmtPct(r.plPct)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${plColor(r.dailyChange)}`}>
                    {loading ? '...' : `${fmtPL(r.dailyChange)} (${fmtPct(r.dailyChangePct)})`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-sm">
                <td className="px-4 py-3 text-slate-800" colSpan={5}>合计</td>
                <td className="px-4 py-3 text-right text-slate-800">{fmt(totalCostBasis)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-slate-800">
                  {loading ? '...' : fmt(totalMarketValue)}
                </td>
                <td className={`px-4 py-3 text-right ${plColor(totalPL)}`}>
                  {loading ? '...' : fmtPL(totalPL)}
                </td>
                <td className={`px-4 py-3 text-right ${plColor(totalPLPct)}`}>
                  {loading ? '...' : fmtPct(totalPLPct)}
                </td>
                <td className={`px-4 py-3 text-right ${plColor(totalDailyChange)}`}>
                  {loading ? '...' : fmtPL(totalDailyChange)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">Fetching live prices from Yahoo Finance...</p>
        </div>
      )}
    </div>
  );
}
