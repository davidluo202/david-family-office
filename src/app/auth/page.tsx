'use client';

import { accessRoles, permissionMatrix } from '@/data/mockData';

function Field({ label, type = 'text', placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input type={type} placeholder={placeholder || label} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
    </label>
  );
}

export default function AuthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Registration, Login & Access Control</h2>
        <p className="text-sm text-slate-500 mt-1">Mock UI for Supabase Auth, family workspace creation, role assignment, and permission management.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Create family workspace</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">The first registered adult becomes temporary Family Admin until ownership is transferred.</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Family / household display name" placeholder="e.g. My Family Office" />
            <Field label="Admin email" type="email" />
            <Field label="Password" type="password" />
            <Field label="MFA method" placeholder="Authenticator app / SMS / email" />
          </div>
          <button className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Register workspace</button>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Member login</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Members sign in to maintain their own profile, income, expenses, and documents.</p>
          <div className="space-y-4">
            <Field label="Email" type="email" />
            <Field label="Password" type="password" />
            <Field label="MFA code" placeholder="6-digit code" />
          </div>
          <button className="mt-5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white">Login</button>
        </section>
      </div>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Role model</h3>
        <div className="grid grid-cols-4 gap-4">
          {accessRoles.map((role) => (
            <div key={role.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-800">{role.label}</p>
              <p className="text-xs text-slate-500 mt-1 min-h-12">{role.desc}</p>
              <ul className="mt-3 space-y-1">
                {role.permissions.map((permission) => (
                  <li key={permission} className="text-xs text-slate-600">• {permission}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Permission matrix</h3>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {['Area', 'Family Admin', 'Adult Member', 'Dependent', 'Advisor'].map((h) => (
            <div key={h} className="font-semibold text-slate-600 bg-slate-100 rounded-lg p-3">{h}</div>
          ))}
          {permissionMatrix.flatMap((row) => [row.area, row.admin, row.adult, row.dependent, row.advisor].map((cell, index) => (
            <div key={`${row.area}-${index}`} className="text-slate-600 bg-slate-50 rounded-lg p-3">{cell}</div>
          )))}
        </div>
      </section>
    </div>
  );
}
