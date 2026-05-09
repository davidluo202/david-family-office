export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',').filter(Boolean) ?? [];
  const type = searchParams.get('type') ?? 'prices'; // prices | analysis | technicals

  if (symbols.length === 0) {
    return Response.json({ error: 'No symbols provided' }, { status: 400 });
  }

  if (type === 'prices') {
    const results: Record<string, { current: number; previousClose: number }> = {};
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );
          if (!res.ok) return;
          const json = await res.json();
          const result = json.chart?.result?.[0];
          if (!result) return;
          const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
          const meta = result.meta;
          const current = meta?.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
          const previousClose = meta?.chartPreviousClose ?? closes[0] ?? current;
          results[symbol] = { current, previousClose };
        } catch { /* skip */ }
      })
    );
    return Response.json(results);
  }

  if (type === 'analysis') {
    // Get crumb first
    let crumb = '';
    let cookies = '';
    try {
      const session = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const setCookies = session.headers.getSetCookie?.() ?? [];
      cookies = setCookies.map(c => c.split(';')[0]).join('; ');
      const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
        headers: { 'User-Agent': 'Mozilla/5.0', Cookie: cookies },
      });
      crumb = await crumbRes.text();
    } catch { /* skip */ }

    const results: Record<string, Record<string, unknown>> = {};
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,financialData,recommendationTrend,price&crumb=${encodeURIComponent(crumb)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0', Cookie: cookies } }
          );
          if (!res.ok) return;
          const json = await res.json();
          const data = json.quoteSummary?.result?.[0];
          if (!data) return;
          const summary = data.summaryDetail ?? {};
          const fin = data.financialData ?? {};
          const price = data.price ?? {};
          const trend = data.recommendationTrend?.trend?.[0] ?? {};
          results[symbol] = {
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
    return Response.json(results);
  }

  if (type === 'technicals') {
    const results: Record<string, Record<string, unknown>> = {};
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );
          if (!res.ok) return;
          const json = await res.json();
          const result = json.chart?.result?.[0];
          if (!result) return;
          let closes: number[] = (result.indicators?.quote?.[0]?.close ?? []).filter((c: number | null) => c !== null);
          let volumes: number[] = (result.indicators?.quote?.[0]?.volume ?? []).filter((v: number | null) => v !== null);
          if (closes.length < 26) return;

          const price = closes[closes.length - 1];
          const ma20 = closes.slice(-20).reduce((s, c) => s + c, 0) / 20;

          const ema = (data: number[], period: number): number[] => {
            const r = [data[0]];
            const k = 2 / (period + 1);
            for (let i = 1; i < data.length; i++) r.push(data[i] * k + r[i - 1] * (1 - k));
            return r;
          };
          const ema12 = ema(closes, 12);
          const ema26 = ema(closes, 26);
          const macdLine = ema12.map((v, i) => v - ema26[i]);
          const signalLine = ema(macdLine, 9);
          const hist = macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1];
          const prevHist = macdLine.length > 1 ? macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2] : 0;
          const vol5 = volumes.slice(-5).reduce((s, v) => s + v, 0) / 5;
          const vol20 = volumes.slice(-20).reduce((s, v) => s + v, 0) / 20;

          results[symbol] = {
            aboveMa20: price > ma20,
            macdBullish: hist > 0,
            macdGolden: hist > 0 && prevHist <= 0,
            macdDeath: hist < 0 && prevHist >= 0,
            volSurge: vol20 > 0 && vol5 > vol20 * 1.3,
            volRatio: vol20 > 0 ? Math.round((vol5 / vol20) * 100) / 100 : 0,
          };
        } catch { /* skip */ }
      })
    );
    return Response.json(results);
  }

  return Response.json({ error: 'Invalid type' }, { status: 400 });
}
