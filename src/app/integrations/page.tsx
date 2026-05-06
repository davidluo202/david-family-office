'use client';

import { financialConnections } from '@/data/mockData';

function UploadCard({ title, desc, examples }: { title: string; desc: string; examples: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <span key={example} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{example}</span>
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bank, Brokerage & Tax Data</h2>
        <p className="text-sm text-slate-500 mt-1">Plan for extracting balances, transactions, and annual income data without storing bank credentials in Mini Family Office.</p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
        <p className="font-semibold text-amber-900">Security principle</p>
        <p className="text-sm text-amber-800 mt-1">
          The product should not save bank usernames, passwords, or MFA codes. For US institutions, use a secure aggregator/OAuth flow where the credential step happens on the provider page and the app receives read-only tokens.
        </p>
      </div>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Connection options</h3>
        <div className="grid grid-cols-2 gap-4">
          {financialConnections.map((item) => (
            <div key={item.provider} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-800">{item.provider}</h4>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{item.status}</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Manual import before API launch</h3>
        <div className="grid grid-cols-2 gap-4">
          <UploadCard title="Bank / credit card statements" desc="Extract balances and categorized transactions from exports." examples={['CSV', 'OFX', 'QFX', 'PDF statement']} />
          <UploadCard title="Tax forms" desc="Extract annual income and deductible/trackable expenses." examples={['W-2', '1099-DIV', '1099-INT', '1099-B', 'K-1', '1098']} />
          <UploadCard title="Property & insurance documents" desc="Capture property tax, home insurance, auto insurance, and repair costs." examples={['Property tax bill', 'Home insurance', 'Auto insurance', 'Repair invoice']} />
          <UploadCard title="Annual planning items" desc="Capture once-a-year income or expenses for budget forecasting." examples={['Travel', 'Vehicle purchase', 'Home repair', 'Vehicle repair', 'Dividend summary']} />
        </div>
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Phase 1.1 API workflow</h3>
        <ol className="space-y-3 text-sm text-slate-600">
          <li>1. Family Admin selects institution and starts secure link flow.</li>
          <li>2. User completes bank login and MFA with the aggregator/OAuth provider.</li>
          <li>3. Mini Family Office receives read-only account and transaction tokens.</li>
          <li>4. Admin maps accounts to household/member ownership and permission scopes.</li>
          <li>5. Scheduled sync updates balances and transactions; no money movement is supported.</li>
        </ol>
      </section>
    </div>
  );
}
