'use client';

import { useEffect, useState } from 'react';
import { robinhoodHoldings, robinhoodCash } from '@/data/mockData';

interface PriceData {
  current: number;
  previousClose: number;
}

type PriceMap = Record<string, PriceData>;

interface TechData {
  aboveMa20: boolean;
  macdBullish: boolean;
  macdGolden: boolean;
  macdDeath: boolean;
  volSurge: boolean;
  volRatio: number;
}

type TechMap = Record<string, TechData>;

interface AnalysisData {
  pe?: number;
  fwdPe?: number;
  marketCap?: number;
  fiftyTwoWkHigh?: number;
  fiftyTwoWkLow?: number;
  targetMean?: number;
  recommendation?: string;
  recBuy?: number;
  recHold?: number;
  recSell?: number;
  revenueGrowth?: number;
}

type AnalysisMap = Record<string, AnalysisData>;

interface Recommendation {
  symbol: string;
  action: string;
  analysis: string;
  color: string;
}

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

async function fetchTechnicals(symbols: string[]): Promise<TechMap> {
  try {
    const res = await fetch(`/api/stocks?type=technicals&symbols=${symbols.join(',')}`);
    if (!res.ok) return {};
    return await res.json() as TechMap;
  } catch { return {}; }
}

async function fetchAnalysis(symbols: string[]): Promise<AnalysisMap> {
  try {
    const res = await fetch(`/api/stocks?type=analysis&symbols=${symbols.join(',')}`);
    if (!res.ok) return {};
    return await res.json() as AnalysisMap;
  } catch { return {}; }
}

function generateRecommendation(
  h: typeof robinhoodHoldings[number],
  a: AnalysisData | undefined,
  currentPrice: number,
  t?: TechData
): Recommendation {
  /**
   * Layered decision: Trend(MA20) → Momentum(MACD) → Volume → Fundamentals → Position Mgmt
   * When trend & momentum agree → strong signal. When conflict → cautious, never contradictory.
   */
  if (!currentPrice) {
    return { symbol: h.symbol, action: 'HOLD', analysis: 'No price data', color: 'text-slate-500 bg-slate-50' };
  }
  const pnlPct = ((currentPrice - h.avgCost) / h.avgCost) * 100;

  // L1: Trend (MA20)
  const trend = t ? (t.aboveMa20 ? 'up' : 'down') : 'unknown';

  // L2: Momentum (MACD)
  let momentum = 'unknown';
  if (t) {
    if (t.macdGolden) momentum = 'golden_cross';
    else if (t.macdDeath) momentum = 'death_cross';
    else if (t.macdBullish) momentum = 'bullish';
    else momentum = 'bearish';
  }

  // L3: Volume
  const volConfirmed = t?.volSurge ?? false;

  // L4: Fundamentals
  let fundScore = 0;
  const fundNotes: string[] = [];
  if (a) {
    if (a.targetMean && currentPrice) {
      const upside = ((a.targetMean - currentPrice) / currentPrice) * 100;
      if (upside > 15) { fundScore += 1; fundNotes.push(`Target $${a.targetMean.toFixed(0)} (+${upside.toFixed(0)}%)`); }
      else if (upside < -10) { fundScore -= 1; fundNotes.push(`Target $${a.targetMean.toFixed(0)} (${upside.toFixed(0)}%)`); }
    }
    if ((a.recBuy ?? 0) > (a.recSell ?? 0) * 2) { fundScore += 1; fundNotes.push(`Consensus: ${a.recommendation?.toUpperCase()}`); }
    else if ((a.recSell ?? 0) > (a.recBuy ?? 0)) { fundScore -= 1; fundNotes.push(`Consensus: ${a.recommendation?.toUpperCase()}`); }
  }

  // L5: Position management
  const profitTake = pnlPct > 30;
  const deepLoss = pnlPct < -30;

  // === Decision (hierarchical, no contradictions) ===
  let action: string;
  let reason: string;
  let color: string;

  if (trend === 'down' && (momentum === 'death_cross' || momentum === 'bearish')) {
    action = 'SELL / REDUCE';
    color = 'text-red-600 bg-red-50';
    reason = `Trend DOWN + MACD ${momentum.replace('_', ' ')}`;
  } else if (trend === 'down' && (momentum === 'golden_cross' || momentum === 'bullish')) {
    action = 'WAIT';
    color = 'text-amber-600 bg-amber-50';
    reason = 'Below MA20 but MACD turning up — wait for MA20 reclaim';
  } else if (trend === 'up' && (momentum === 'golden_cross' || momentum === 'bullish')) {
    if (volConfirmed || fundScore > 0) {
      action = 'BUY / ADD';
      color = 'text-green-600 bg-green-50';
      reason = `Trend UP + MACD ${momentum.replace('_', ' ')}` + (volConfirmed ? ' + vol confirmed' : ' + fundamentals support');
    } else {
      action = 'HOLD (Bullish)';
      color = 'text-emerald-600 bg-emerald-50';
      reason = `Trend UP + MACD ${momentum.replace('_', ' ')} — ride the trend`;
    }
  } else if (trend === 'up' && (momentum === 'death_cross' || momentum === 'bearish')) {
    action = 'HOLD (Caution)';
    color = 'text-amber-600 bg-amber-50';
    reason = 'Above MA20 but MACD weakening — watch for breakdown';
  } else {
    action = fundScore >= 1 ? 'HOLD (Bullish)' : fundScore <= -1 ? 'HOLD (Cautious)' : 'HOLD';
    color = fundScore >= 1 ? 'text-emerald-600 bg-emerald-50' : fundScore <= -1 ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50';
    reason = fundNotes.length > 0 ? fundNotes[0] : 'Awaiting technical data';
  }

  // Append fund note
  if (fundNotes.length > 0 && !reason.includes('Target') && !reason.includes('Consensus')) {
    reason += ` | ${fundNotes[0]}`;
  }

  // Position management override
  if (profitTake && (action === 'HOLD (Bullish)' || action === 'BUY / ADD')) {
    action = 'PARTIAL SELL';
    color = 'text-orange-600 bg-orange-50';
    reason = `Gain +${pnlPct.toFixed(0)}% > 30%: take partial profits | ${reason}`;
  } else if (profitTake && action.includes('SELL')) {
    reason = `Gain +${pnlPct.toFixed(0)}%: lock in profits | ${reason}`;
  } else if (deepLoss && action.includes('SELL')) {
    reason = `Loss ${pnlPct.toFixed(0)}%: cut loss | ${reason}`;
  }

  return { symbol: h.symbol, action, analysis: reason, color };
}

async function fetchPrices(symbols: string[]): Promise<PriceMap> {
  try {
    const res = await fetch(`/api/stocks?type=prices&symbols=${symbols.join(',')}`);
    if (!res.ok) return {};
    return await res.json() as PriceMap;
  } catch { return {}; }
}

export default function PortfolioPage() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [analysisData, setAnalysisData] = useState<AnalysisMap>({});
  const [techData, setTechData] = useState<TechMap>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const symbols = robinhoodHoldings.map((h) => h.symbol);
    fetchPrices(symbols)
      .then((pm) => {
        setPrices(pm);
        if (Object.keys(pm).length === 0) {
          setError('Unable to fetch prices from Yahoo Finance');
        }
        // Fetch analysis + technicals after prices
        Promise.all([fetchAnalysis(symbols), fetchTechnicals(symbols)]).then(([am, tm]) => {
          setAnalysisData(am);
          setTechData(tm);
          const recs = robinhoodHoldings.map((h) => {
            const p = pm[h.symbol];
            return generateRecommendation(h, am[h.symbol], p?.current ?? 0, tm[h.symbol]);
          });
          setRecommendations(recs);
          setAnalysisLoading(false);
        }).catch(() => setAnalysisLoading(false));
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

      {/* Analysis & Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">持仓分析与建议 / Position Analysis</h3>
          <p className="text-xs text-slate-400 mt-1">
            Based on P/E, analyst targets, consensus ratings, 52-week range, revenue growth, and P&L position.
          </p>
        </div>
        {analysisLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">Loading analysis data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-medium">
                  <th className="text-left px-4 py-3">代码</th>
                  <th className="text-right px-4 py-3">现价</th>
                  <th className="text-right px-4 py-3">P/E</th>
                  <th className="text-right px-4 py-3">目标价</th>
                  <th className="text-center px-4 py-3">MACD</th>
                  <th className="text-center px-4 py-3">MA20</th>
                  <th className="text-center px-4 py-3">建议</th>
                  <th className="text-left px-4 py-3">分析</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => {
                  const a = analysisData[rec.symbol];
                  const t = techData[rec.symbol];
                  const p = prices[rec.symbol];
                  const curr = p?.current ?? 0;
                  const pe = a?.pe ? a.pe.toFixed(1) : '--';
                  const target = a?.targetMean ? `$${a.targetMean.toFixed(0)}` : '--';
                  const macdLabel = t ? (t.macdGolden ? 'Golden X' : t.macdDeath ? 'Death X' : t.macdBullish ? 'Bullish' : 'Bearish') : '--';
                  const macdColor = t ? (t.macdGolden ? 'text-green-600' : t.macdDeath ? 'text-red-500' : t.macdBullish ? 'text-emerald-500' : 'text-orange-500') : 'text-slate-400';
                  const ma20Label = t ? (t.aboveMa20 ? 'Above' : 'Below') : '--';
                  const ma20Color = t ? (t.aboveMa20 ? 'text-green-600' : 'text-red-500') : 'text-slate-400';
                  return (
                    <tr key={rec.symbol} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{rec.symbol}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">
                        {curr ? fmtPrice(curr) : '--'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-600">{pe}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-600">{target}</td>
                      <td className={`px-4 py-3 text-xs text-center font-medium ${macdColor}`}>{macdLabel}</td>
                      <td className={`px-4 py-3 text-xs text-center font-medium ${ma20Color}`}>{ma20Label}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rec.color}`}>
                          {rec.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">{rec.analysis}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            Disclaimer: This is automated analysis for reference only, not investment advice. Always do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}
