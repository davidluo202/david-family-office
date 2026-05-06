'use client';

interface FamilyMember {
  id: string;
  name: string;
  nameZh: string;
  role: string;
  dob: string;
  status: string;
  jurisdiction: string;
  lifeStage: string;
  occupation?: string;
  educationStage?: string;
  avatar: string;
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const roleLabels: Record<string, string> = {
  primary: 'Primary',
  spouse: 'Spouse',
  child: 'Child',
};

const jurisdictionFlags: Record<string, string> = {
  US: '🇺🇸',
  HK: '🇭🇰',
  both: '🇺🇸 🇭🇰',
};

const stageLabels: Record<string, string> = {
  career: 'Career',
  education: 'Education',
  retirement: 'Retired',
};

export default function FamilyMemberCard({ member }: { member: FamilyMember }) {
  const age = calcAge(member.dob);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {member.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">{member.name}</h3>
            <span className="text-sm text-slate-400">{member.nameZh}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              {roleLabels[member.role] || member.role}
            </span>
            <span className="text-xs text-slate-400">Age {age}</span>
            <span className="text-sm">{jurisdictionFlags[member.jurisdiction] || ''}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Life Stage</span>
          <span className="text-slate-700 font-medium">{stageLabels[member.lifeStage] || member.lifeStage}</span>
        </div>
        {member.occupation && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Occupation</span>
            <span className="text-slate-700 font-medium">{member.occupation}</span>
          </div>
        )}
        {member.educationStage && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Education</span>
            <span className="text-slate-700 font-medium capitalize">{member.educationStage.replace('_', ' ')}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Status</span>
          <span className="text-green-600 font-medium capitalize">{member.status}</span>
        </div>
      </div>
    </div>
  );
}
