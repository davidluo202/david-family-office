'use client';

import FamilyMemberCard from '@/components/FamilyMemberCard';
import { familyMembers } from '@/data/mockData';

export default function FamilyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Family Members</h2>
        <p className="text-sm text-slate-500 mt-1">Overview of all family members and their status</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {familyMembers.map((member) => (
          <FamilyMemberCard key={member.id} member={member} />
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Family Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{familyMembers.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total Members</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {familyMembers.filter((m) => m.role === 'primary' || m.role === 'spouse').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Adults</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {familyMembers.filter((m) => m.role === 'child').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Children</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {familyMembers.filter((m) => m.jurisdiction === 'both').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Dual Jurisdiction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
