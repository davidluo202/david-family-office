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
  const map: TechMap = {};
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`
        );
        if (!res.ok) return;
        const json = await res.json();
        const result = json.chart?.result?.[0];
        if (!result) return;
        let closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
        let volumes: number[] = result.indicators?.quote?.[0]?.volume ?? [];
        closes = closes.filter((c: number | null) => c !== null);
        volumes = volumes.filter((v: number | null) => v !== null);
        if (closes.length < 26) return;

        const price = closes[closes.length - 1];
        const ma20 = closes.slice(-20).reduce((s, c) => s + c, 0) / 20;
        const aboveMa20 = price > ma20;

        const ema = (data: number[], period: number): number[] => {
          const result = [data[0]];
          const k = 2 / (period + 1);
          for (let i = 1; i < data.length; i++) {
            result.push(data[i] * k + result[i - 1] * (1 - k));
          }
          return result;
        };
        const ema12 = ema(closes, 12);
        const ema26 = ema(closes, 26);
        const macdLine = ema12.map((v, i) => v - ema26[i]);
        const signalLine = ema(macdLine, 9);
        const hist = macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1];
        const prevHist = macdLine.length > 1 ? macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2] : 0;

        const vol5 = volumes.slice(-5).reduce((s, v) => s + v, 0) / 5;
        const vol20 = volumes.slice(-20).reduce((s, v) => s + v, 0) / 20;

        map[symbol] = {
          aboveMa20,
          macdBullish: hist > 0,
          macdGolden: hist > 0 && prevHist <= 0,
          macdDeath: hist < 0 && prevHist >= 0,
          volSurge: vol20 > 0 && vol5 > vol20 * 1.3,
          volRatio: vol20 > 0 ? Math.round((vol5 / vol20) * 100) / 100 : 0,
        };
      } catch { /* skip */ }
    })
  );
  return map;
}

async function getYahooCrumb(): Promise<{ crumb: string }> {
  try {
    await fetch('https://fc.yahoo.com', { credentials: 'include' }).catch(() => {});
    const res = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', { credentials: 'include' });
    const crumb = await res.text();
    return { crumb };
  } catch {
    return { crumb: '' };
  }
}

async function fetchAnalysis(symbols: string[]): Promise<AnalysisMap> {
  const map: AnalysisMap = {};
  const { crumb } = await getYahooCrumb();
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,financialData,recommendationTrend,price&crumb=${encodeURIComponent(crumb)}`,
          { credentials: 'include' }
        );
        if (!res.ok) return;
        const json = await res.json();
        const data = json.quoteSummary?.result?.[0];
        if (!data) return;
        const summary = data.summaryDetail ?? {};
        const fin = data.financialData ?? {};
        const price = data.price ?? {};
        const trend = data.recommendationTrend?.trend?.[0] ?? {};
        map[symbol] = {
          pe: summary.trailingPE?.raw,
          fwdPe: summary.forwardPE?.raw,
          marketCap: price.marketCap?.raw,
          fiftyTwoWkHigh: summary.fiftyTwoWeekHigh?.raw,
          fiftyTwoWkLow: summary.fiftyTwoWeekLow?.raw,
          targetMean: fin.targetMeanPrice?.raw,
          recommendation: fin.recommendationKey,
          recBuy: (trend.strongBuy ?? 0) + (trend.buy ?? 0),
          recHold: trend.hold ?? 0,
          recSell: (trend.sell ?? 0) + (trend.strongSell ?? 0),
          revenueGrowth: fin.revenueGrowth?.raw,
        };
      } catch { /* skip */ }
    })
  );
  return map;
}

function generateRecommendation(
  h: typeof robinhoodHoldings[number],
  a: AnalysisData | undefined,
  currentPrice: number,
  t?: TechData
): Recommendation {
  if (!a || !currentPrice) {
    return { symbol: h.symbol, action: 'HOLD', analysis: 'Data unavailable', color: 'text-slate-500' };
  }
  const pnlPct = ((currentPrice - h.avgCost) / h.avgCost) * 100;
  const signals: string[] = [];
  let score = 0;

  if (a.fwdPe && a.pe && a.fwdPe < a.pe) {
    signals.push(`Fwd P/E (${a.fwdPe.toFixed(1)}) < Trailing (${a.pe.toFixed(1)})`);
    score += 1;
  } else if (a.pe && a.pe > 50) {
    signals.push(`High P/E (${a.pe.toFixed(1)})`);
    score -= 1;
  }

  if (a.targetMean && currentPrice) {
    const upside = ((a.targetMean - currentPrice) / currentPrice) * 100;
    signals.push(`Target $${a.targetMean.toFixed(0)} (${upside >= 0 ? '+' : ''}${upside.toFixed(0)}%)`);
    if (upside > 15) score += 2;
    else if (upside < -10) score -= 2;
  }

  if (a.recBuy !== undefined && a.recSell !== undefined) {
    const rec = a.recommendation?.toUpperCase() ?? '';
    signals.push(`${rec} (${a.recBuy}B/${a.recHold}H/${a.recSell}S)`);
    if (a.recBuy > (a.recSell ?? 0) * 2) score += 1;
    else if ((a.recSell ?? 0) > a.recBuy) score -= 1;
  }

  if (a.fiftyTwoWkHigh && a.fiftyTwoWkLow && currentPrice) {
    const range = a.fiftyTwoWkHigh !== a.fiftyTwoWkLow
      ? ((currentPrice - a.fiftyTwoWkLow) / (a.fiftyTwoWkHigh - a.fiftyTwoWkLow)) * 100
      : 50;
    if (range > 90) { signals.push(`Near 52wk high`); score -= 1; }
    else if (range < 20) { signals.push(`Near 52wk low`); score += 1; }
  }

  if (a.revenueGrowth) {
    if (a.revenueGrowth > 0.2) { signals.push(`Rev +${(a.revenueGrowth * 100).toFixed(0)}%`); score += 1; }
    else if (a.revenueGrowth < 0) { signals.push(`Rev ${(a.revenueGrowth * 100).toFixed(0)}%`); score -= 1; }
  }

  if (pnlPct > 30) { signals.push(`Gain ${pnlPct.toFixed(0)}%: consider partial profit-taking (>30% rule)`); score -= 1; }
  else if (pnlPct < -30) signals.push(`Significant loss (${pnlPct.toFixed(0)}%): review thesis`);

  // Technical signals (4 rules)
  if (t) {
    if (t.macdGolden) { signals.push('MACD golden cross'); score += 2; }
    else if (t.macdDeath) { signals.push('MACD death cross'); score -= 2; }
    else if (t.macdBullish) { signals.push('MACD bullish'); score += 1; }
    else { signals.push('MACD bearish'); score -= 1; }

    if (t.aboveMa20) { signals.push('Above MA20'); score += 1; }
    else { signals.push('Below MA20 (STOP-LOSS)'); score -= 2; }

    if (t.volSurge && t.aboveMa20) { signals.push(`Vol surge x${t.volRatio}`); score += 1; }
  }

  let action: string;
  let color: string;
  if (score >= 3) { action = 'BUY / ADD'; color = 'text-green-600 bg-green-50'; }
  else if (score >= 1) { action = 'HOLD (Bullish)'; color = 'text-emerald-600 bg-emerald-50'; }
  else if (score <= -3) { action = 'SELL / REDUCE'; color = 'text-red-600 bg-red-50'; }
  else if (score <= -1) { action = 'HOLD (Cautious)'; color = 'text-amber-600 bg-amber-50'; }
  else { action = 'HOLD'; color = 'text-slate-600 bg-slate-50'; }

  return { symbol: h.symbol, action, analysis: signals.slice(0, 4).join(' | ') || 'Insufficient data', color };
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
