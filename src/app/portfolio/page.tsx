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
  actionZh: string;
  analysis: string;
  detail: string;
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
    return { symbol: h.symbol, action: 'HOLD', actionZh: '持币观望', analysis: '暂无数据', detail: '', color: 'text-slate-500 bg-slate-50' };
  }
  const pnlPct = ((currentPrice - h.avgCost) / h.avgCost) * 100;
  const mktVal = currentPrice * h.qty;

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
      if (upside > 15) { fundScore += 1; fundNotes.push(`分析师目标价 $${a.targetMean.toFixed(0)}（上行空间 ${upside.toFixed(0)}%）`); }
      else if (upside < -10) { fundScore -= 1; fundNotes.push(`分析师目标价 $${a.targetMean.toFixed(0)}（下行风险 ${upside.toFixed(0)}%）`); }
      else { fundNotes.push(`分析师目标价 $${a.targetMean.toFixed(0)}（${upside >= 0 ? '+' : ''}${upside.toFixed(0)}%）`); }
    }
    if ((a.recBuy ?? 0) > (a.recSell ?? 0) * 2) { fundScore += 1; }
    else if ((a.recSell ?? 0) > (a.recBuy ?? 0)) { fundScore -= 1; }
  }
  // L5: Position management
  const profitTake = pnlPct > 30;

  // === Build detailed report ===
  const lines: string[] = [];
  lines.push(`【${h.symbol}】${h.name}`);
  lines.push(`类别：${h.category}`);
  lines.push(`持仓：${Number.isInteger(h.qty) ? h.qty : h.qty.toFixed(2)} 股 | 均价 $${h.avgCost.toFixed(2)} | 成本 $${h.costBasis.toLocaleString()}`);
  lines.push(`现价：$${currentPrice.toFixed(2)} | 市值 $${mktVal.toLocaleString(undefined, {maximumFractionDigits:0})} | 盈亏 ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%`);
  lines.push('');
  lines.push('--- 技术面分析 ---');
  if (t) {
    lines.push(`趋势(MA20)：价格${t.aboveMa20 ? '在MA20上方，处于上升趋势' : '跌破MA20，处于下降趋势'}`);
    const macdDesc = momentum === 'golden_cross' ? 'MACD金叉（强烈买入信号）'
      : momentum === 'death_cross' ? 'MACD死叉（强烈卖出信号）'
      : momentum === 'bullish' ? 'MACD多头排列，动能向上'
      : 'MACD空头排列，动能减弱';
    lines.push(`动量(MACD)：${macdDesc}`);
    lines.push(`成交量：${volConfirmed ? '近5日成交量显著放大，信号可靠性增强' : '成交量正常，无异常放量'}`);
  } else {
    lines.push('技术数据暂未获取');
  }
  lines.push('');
  lines.push('--- 基本面分析 ---');
  if (a) {
    if (a.pe) lines.push(`市盈率(P/E)：${a.pe.toFixed(1)}${a.fwdPe ? ` | 预期P/E：${a.fwdPe.toFixed(1)}${a.fwdPe < a.pe ? '（盈利增长预期）' : ''}` : ''}`);
    if (a.marketCap) lines.push(`市值：${a.marketCap > 1e9 ? `$${(a.marketCap / 1e9).toFixed(1)}B` : `$${(a.marketCap / 1e6).toFixed(0)}M`}`);
    if (fundNotes.length > 0) fundNotes.forEach(n => lines.push(n));
    if (a.recBuy !== undefined) lines.push(`分析师评级：${a.recBuy}个买入 / ${a.recHold}个持有 / ${a.recSell}个卖出`);
    if (a.revenueGrowth) lines.push(`营收增长：${(a.revenueGrowth * 100).toFixed(1)}%`);
  } else {
    lines.push('基本面数据暂未获取');
  }
  lines.push('');
  lines.push('--- 仓位管理 ---');
  if (pnlPct > 30) lines.push(`当前盈利 +${pnlPct.toFixed(0)}%，已超过30%止盈线，建议分批止盈锁定利润`);
  else if (pnlPct > 0) lines.push(`当前盈利 +${pnlPct.toFixed(0)}%，未触及30%止盈线，继续持有`);
  else if (pnlPct > -30) lines.push(`当前亏损 ${pnlPct.toFixed(0)}%，在可控范围内`);
  else lines.push(`当前亏损 ${pnlPct.toFixed(0)}%，已超过-30%，需要审视投资逻辑是否成立`);

  // === Decision ===
  let action: string;
  let actionZh: string;
  let color: string;
  let summary: string;

  if (trend === 'down' && (momentum === 'death_cross' || momentum === 'bearish')) {
    action = 'SELL'; actionZh = '建议卖出'; color = 'text-red-600 bg-red-50';
    summary = '趋势和动量均看跌';
    lines.push(''); lines.push('--- 操作建议 ---');
    lines.push('股价跌破MA20且MACD空头，趋势和动量双重确认下行。建议逐步减持或设定止损位清仓，避免进一步亏损。');
  } else if (trend === 'down' && (momentum === 'golden_cross' || momentum === 'bullish')) {
    action = 'WAIT'; actionZh = '到价买入'; color = 'text-amber-600 bg-amber-50';
    summary = '等待突破MA20';
    lines.push(''); lines.push('--- 操作建议 ---');
    lines.push('MACD出现转多信号，但股价仍在MA20下方。建议观望，待股价放量突破MA20后再考虑买入。可设定MA20价位作为触发买入点。');
    if (t) lines.push(`当前MA20参考价位：关注股价能否站稳MA20上方`);
  } else if (trend === 'up' && (momentum === 'golden_cross' || momentum === 'bullish')) {
    if (volConfirmed || fundScore > 0) {
      action = 'BUY'; actionZh = '逐步加仓'; color = 'text-green-600 bg-green-50';
      summary = '趋势动量量价共振';
      lines.push(''); lines.push('--- 操作建议 ---');
      lines.push('MA20上方运行+MACD多头' + (volConfirmed ? '+成交量放大确认' : '+基本面支撑') + '，多重信号共振。建议分批加仓，设定MA20为止损位。');
    } else {
      action = 'HOLD'; actionZh = '持币待涨'; color = 'text-emerald-600 bg-emerald-50';
      summary = '趋势向好继续持有';
      lines.push(''); lines.push('--- 操作建议 ---');
      lines.push('股价在MA20上方且MACD多头排列，趋势良好。继续持有，以MA20为止损参考。如果MACD出现死叉或股价跌破MA20，则考虑减持。');
    }
  } else if (trend === 'up' && (momentum === 'death_cross' || momentum === 'bearish')) {
    action = 'CAUTION'; actionZh = '谨慎持有'; color = 'text-amber-600 bg-amber-50';
    summary = '动量减弱注意风险';
    lines.push(''); lines.push('--- 操作建议 ---');
    lines.push('股价仍在MA20上方但MACD已转弱，上涨动能不足。暂时持有但需密切关注：若股价跌破MA20则触发止损卖出。不建议此时加仓。');
  } else {
    actionZh = fundScore >= 1 ? '持币待涨' : fundScore <= -1 ? '谨慎持有' : '持币观望';
    action = 'HOLD';
    color = fundScore >= 1 ? 'text-emerald-600 bg-emerald-50' : fundScore <= -1 ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50';
    summary = '等待更多信号';
    lines.push(''); lines.push('--- 操作建议 ---');
    lines.push('技术信号不明确，建议维持现有仓位观望，等待趋势明朗后再做决策。');
  }

  // Position management override
  if (profitTake && (actionZh === '持币待涨' || actionZh === '逐步加仓')) {
    actionZh = '分批止盈';
    color = 'text-orange-600 bg-orange-50';
    summary = `盈利${pnlPct.toFixed(0)}%达止盈线`;
    lines.push(`注意：当前盈利已超过30%止盈线（+${pnlPct.toFixed(0)}%），建议先卖出1/3-1/2锁定利润，剩余仓位跟随趋势。`);
  }

  return { symbol: h.symbol, action, actionZh, analysis: summary, detail: lines.join('\n'), color };
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
  const [modalRec, setModalRec] = useState<Recommendation | null>(null);
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
                  <th className="text-center px-4 py-3">操作建议</th>
                  <th className="text-center px-4 py-3">详情</th>
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
                          {rec.actionZh}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setModalRec(rec)}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          查看分析
                        </button>
                      </td>
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

      {/* Detail Modal */}
      {modalRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalRec(null)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{modalRec.symbol} 分析报告</h3>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${modalRec.color}`}>
                  {modalRec.actionZh}
                </span>
              </div>
              <button
                onClick={() => setModalRec(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
                {modalRec.detail}
              </pre>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <p className="text-[10px] text-slate-400">
                数据来源：Yahoo Finance | 分析方法：MA20趋势+MACD动量+成交量+基本面 | 仅供参考，不构成投资建议
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
