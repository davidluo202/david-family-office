'use client';

import { useState } from 'react';
import type { FamilyMember, PersonalExpense } from '@/lib/types';
import { DEFAULT_PERSONAL_EXPENSES } from '@/lib/types';

interface Props {
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSave, onCancel }: Props) {
  const isEdit = !!member;
  const [name, setName] = useState(member?.name || '');
  const [nameZh, setNameZh] = useState(member?.nameZh || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(member?.gender || 'male');
  const [dob, setDob] = useState(member?.dob || '');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>(member?.relationship || 'self');
  const [jurisdiction, setJurisdiction] = useState<FamilyMember['jurisdiction']>(member?.jurisdiction || 'US');
  const [citizenship, setCitizenship] = useState(member?.citizenship || '');
  const [taxResidency, setTaxResidency] = useState(member?.taxResidency || '');
  const [occupation, setOccupation] = useState(member?.occupation || '');
  const [employer, setEmployer] = useState(member?.employer || '');
  const [startDate, setStartDate] = useState(member?.startDate || '');
  const [monthlySalary, setMonthlySalary] = useState(member?.monthlySalary?.toString() || '0');
  const [lifeStage, setLifeStage] = useState<'education' | 'career' | 'retirement'>(member?.lifeStage || 'career');
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>(
    member?.personalExpenses || DEFAULT_PERSONAL_EXPENSES.map((e) => ({ ...e }))
  );

  const handleExpenseChange = (index: number, amount: string) => {
    const updated = [...personalExpenses];
    updated[index] = { ...updated[index], amount: parseFloat(amount) || 0 };
    setPersonalExpenses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const result: FamilyMember = {
      id: member?.id || crypto.randomUUID(),
      name: name.trim(),
      nameZh: nameZh.trim(),
      gender,
      dob,
      relationship,
      jurisdiction,
      citizenship,
      taxResidency,
      occupation,
      employer,
      startDate,
      monthlySalary: parseFloat(monthlySalary) || 0,
      lifeStage,
      personalExpenses,
      avatar: name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
      createdAt: member?.createdAt || now,
      updatedAt: now,
    };
    onSave(result);
  };

  const inputClass = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const subLabelClass = 'text-slate-400 font-normal text-xs';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">
        {isEdit ? '编辑成员 / Edit Member' : '添加成员 / Add Member'}
      </h3>

      {/* Basic Info */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">基本信息 / Basic Info</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>姓名 <span className={subLabelClass}>Name</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="John Smith" />
          </div>
          <div>
            <label className={labelClass}>中文名 <span className={subLabelClass}>Chinese Name</span></label>
            <input type="text" value={nameZh} onChange={(e) => setNameZh(e.target.value)} className={inputClass} placeholder="张三" />
          </div>
          <div>
            <label className={labelClass}>性别 <span className={subLabelClass}>Gender</span></label>
            <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')} className={inputClass}>
              <option value="male">男 / Male</option>
              <option value="female">女 / Female</option>
              <option value="other">其他 / Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>出生日期 <span className={subLabelClass}>Date of Birth</span></label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>关系 <span className={subLabelClass}>Relationship</span></label>
            <select value={relationship} onChange={(e) => setRelationship(e.target.value as FamilyMember['relationship'])} className={inputClass}>
              <option value="self">本人 / Self</option>
              <option value="spouse">配偶 / Spouse</option>
              <option value="child">子女 / Child</option>
              <option value="parent">父母 / Parent</option>
              <option value="other">其他 / Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>生命阶段 <span className={subLabelClass}>Life Stage</span></label>
            <select value={lifeStage} onChange={(e) => setLifeStage(e.target.value as 'education' | 'career' | 'retirement')} className={inputClass}>
              <option value="education">教育 / Education</option>
              <option value="career">职业 / Career</option>
              <option value="retirement">退休 / Retirement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">身份信息 / Identity</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>管辖区 <span className={subLabelClass}>Jurisdiction</span></label>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value as FamilyMember['jurisdiction'])} className={inputClass}>
              <option value="US">美国 / US</option>
              <option value="HK">香港 / HK</option>
              <option value="both">双重 / Both</option>
              <option value="other">其他 / Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>国籍 <span className={subLabelClass}>Citizenship</span></label>
            <input type="text" value={citizenship} onChange={(e) => setCitizenship(e.target.value)} className={inputClass} placeholder="US" />
          </div>
          <div>
            <label className={labelClass}>税务居民 <span className={subLabelClass}>Tax Residency</span></label>
            <input type="text" value={taxResidency} onChange={(e) => setTaxResidency(e.target.value)} className={inputClass} placeholder="US" />
          </div>
        </div>
      </div>

      {/* Career/Education */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">职业/学习 / Career/Education</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>职业 <span className={subLabelClass}>Occupation</span></label>
            <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} placeholder="Software Engineer" />
          </div>
          <div>
            <label className={labelClass}>雇主/学校 <span className={subLabelClass}>Employer/School</span></label>
            <input type="text" value={employer} onChange={(e) => setEmployer(e.target.value)} className={inputClass} placeholder="Google / MIT" />
          </div>
          <div>
            <label className={labelClass}>开始日期 <span className={subLabelClass}>Start Date</span></label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>月薪 <span className={subLabelClass}>Monthly Salary ($)</span></label>
            <input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} className={inputClass} min="0" step="100" />
          </div>
        </div>
      </div>

      {/* Personal Monthly Expenses */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">个人月度固定开销 / Personal Monthly Expenses</h4>
        <div className="grid grid-cols-3 gap-4">
          {personalExpenses.map((exp, i) => (
            <div key={i}>
              <label className={labelClass}>
                {exp.labelZh} <span className={subLabelClass}>{exp.label}</span>
              </label>
              <input
                type="number"
                value={exp.amount || ''}
                onChange={(e) => handleExpenseChange(i, e.target.value)}
                className={inputClass}
                min="0"
                step="10"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          取消 / Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {isEdit ? '保存 / Save' : '添加 / Add'}
        </button>
      </div>
    </form>
  );
}
