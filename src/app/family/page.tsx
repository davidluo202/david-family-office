'use client';

import { useEffect, useState } from 'react';
import { loadMembers, saveMembers } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import type { FamilyMember } from '@/lib/types';

import FamilyMemberCard from '@/components/FamilyMemberCard';
import MemberForm from '@/components/MemberForm';

export default function FamilyPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    setMembers(loadMembers());
  }, []);

  const handleSave = (member: FamilyMember) => {
    let updated: FamilyMember[];
    if (editingMember) {
      updated = members.map((m) => (m.id === member.id ? member : m));
    } else {
      updated = [...members, member];
    }
    saveMembers(updated);
    setMembers(updated);
    setShowForm(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('确认删除该成员？/ Confirm delete?')) return;
    const updated = members.filter((m) => m.id !== id);
    saveMembers(updated);
    setMembers(updated);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const adults = members.filter((m) => m.relationship === 'self' || m.relationship === 'spouse' || m.relationship === 'parent').length;
  const children = members.filter((m) => m.relationship === 'child').length;
  const dualJurisdiction = members.filter((m) => m.jurisdiction === 'both').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">家庭成员</h2>
          <p className="text-sm text-slate-500 mt-1">Family Members - 管理所有家庭成员信息</p>
        </div>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + 添加成员
          </button>
        )}
      </div>

      {showForm && (
        <MemberForm
          member={editingMember}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {members.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">&#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F467;&#x200D;&#x1F466;</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">暂无家庭成员</h3>
          <p className="text-sm text-slate-500 mb-4">No family members yet. Add your first member to get started.</p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + 添加第一位成员
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onEdit={() => handleEdit(member)}
                onDelete={() => handleDelete(member.id)}
              />
            ))}
          </div>

          {members.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">家庭概况 / Family Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{members.length}</p>
                  <p className="text-xs text-slate-500 mt-1">总成员 / Total</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{adults}</p>
                  <p className="text-xs text-slate-500 mt-1">成人 / Adults</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{children}</p>
                  <p className="text-xs text-slate-500 mt-1">子女 / Children</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{dualJurisdiction}</p>
                  <p className="text-xs text-slate-500 mt-1">双重管辖 / Dual Jurisdiction</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
