'use client';

import type { FamilyMember } from '@/lib/types';

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const relationLabels: Record<string, string> = {
  self: '本人',
  spouse: '配偶',
  child: '子女',
  parent: '父母',
  other: '其他',
};


const jurisdictionFlags: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  HK: '\u{1F1ED}\u{1F1F0}',
  both: '\u{1F1FA}\u{1F1F8} \u{1F1ED}\u{1F1F0}',
  other: '\u{1F30D}',
};

const stageLabels: Record<string, string> = {
  career: '职业',
  education: '教育',
  retirement: '退休',
};

interface Props {
  member: FamilyMember;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FamilyMemberCard({ member, isAdmin, onEdit, onDelete }: Props) {
  const age = calcAge(member.dob);
  const totalPersonalExpenses = member.personalExpenses?.reduce((s, e) => s + e.amount, 0) || 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            member.avatar
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">{member.name}</h3>
            {member.nameZh && <span className="text-sm text-slate-400">{member.nameZh}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              {relationLabels[member.relationship] || member.relationship}
            </span>
            {age !== null && <span className="text-xs text-slate-400">{age}岁</span>}
            <span className="text-sm">{jurisdictionFlags[member.jurisdiction] || ''}</span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              删除
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">生命阶段 / Life Stage</span>
          <span className="text-slate-700 font-medium">{stageLabels[member.lifeStage] || member.lifeStage}</span>
        </div>
        {member.occupation && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">职业 / Occupation</span>
            <span className="text-slate-700 font-medium">{member.occupation}</span>
          </div>
        )}
        {member.employer && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">雇主 / Employer</span>
            <span className="text-slate-700 font-medium">{member.employer}</span>
          </div>
        )}
        {member.monthlySalary > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">月薪 / Salary</span>
            <span className="text-green-600 font-medium">${member.monthlySalary.toLocaleString()}</span>
          </div>
        )}
        {totalPersonalExpenses > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">个人月度开销 / Personal</span>
            <span className="text-red-500 font-medium">${totalPersonalExpenses.toLocaleString()}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">手机 / Phone</span>
            <span className="text-slate-700 font-medium">{member.phone}</span>
          </div>
        )}
        {member.email && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">邮箱 / Email</span>
            <span className="text-slate-700 font-medium truncate max-w-[160px]">{member.email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
