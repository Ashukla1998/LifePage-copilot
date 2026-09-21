'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiEdit2, FiPlus, FiSearch, FiCheck, FiSlash } from 'react-icons/fi';
import { AkaMember } from './types';
import MemberModal from './components/MemberModal';
import StatusModal from './components/StatusModal';

const INITIAL_MEMBERS: AkaMember[] = [
  {
    memberid: 101,
    name: 'Dr. Arjun Verma',
    role: 'Lead Mentor',
    photo: 'https://placehold.co/150x150?text=AV',
    degree: 'B.Tech, Ph.D in AI',
    category: 'Design Team',
    experience: '2018',
    is_active: true,
    description: 'Expert in career strategy and computational technology.',
  },
  {
    memberid: 102,
    name: 'Priya Sharma',
    role: 'Career Consultant',
    photo: 'https://placehold.co/150x150?text=PS',
    degree: 'MBA, B.Com',
    category: 'Management Team',
    experience: '2021',
    is_active: false,
    description: 'Specializes in higher education paths and corporate coaching.',
  },
];

function sanitizeDegree(degree?: string | string[]): string {
  if (!degree) return 'N/A';

  if (Array.isArray(degree)) {
    return degree.join(', ');
  }

  const cleaned = degree.replace(/[{}\[\]\\"]/g, '').trim();
  return cleaned || 'N/A';
}

export default function AkaMemberPage() {
  const [members, setMembers] = useState<AkaMember[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState('');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AkaMember | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('https://www.lifepage.in/n/api/GetAkaMember');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success === 1 && result.data) {
          if (Array.isArray(result.data)) {
            setMembers(result.data);
          } else {
            setMembers([result.data]);
          }
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  const handleYear = (year: string) => {
    const currentYear = new Date().getFullYear();
    const num = parseInt(year, 10);
    if (isNaN(num)) return year;
    const diff = currentYear - num;
    return diff >= 0 ? `${diff}+ Years` : year;
  };

  const handleOpenAdd = () => {
    setSelectedMember(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEdit = (member: AkaMember) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  const handleOpenStatusModal = (member: AkaMember) => {
    setSelectedMember(member);
    setIsStatusModalOpen(true);
  };

  // Called when a member is added or edited via MemberModal
  const handleMemberSuccess = (savedMember: AkaMember) => {
    setMembers((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.some((m) => String(m.memberid) === String(savedMember.memberid));
      if (exists) {
        return list.map((m) =>
          String(m.memberid) === String(savedMember.memberid) ? savedMember : m
        );
      }
      return [savedMember, ...list];
    });
  };

  // Called when status is toggled via StatusModal and PUT API succeeds
  const handleStatusSuccess = (updatedMember: AkaMember) => {
    setMembers((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) =>
        String(m.memberid) === String(updatedMember.memberid) ? updatedMember : m
      )
    );
  };

  const memberList = Array.isArray(members) ? members : [];
  const filteredMembers = memberList.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.role?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase()) ||
      m.degree?.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AKA Members
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage member profiles, academic qualifications, and status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow active:scale-95"
          >
            <FiPlus className="text-base" />
            Add Member
          </button>
        </div>

        {/* Card Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, degree, or category..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <span className="text-xs font-medium text-slate-400">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Member</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Role & Experience</th>
                  <th scope="col" className="px-6 py-3.5">Qualifications</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.memberid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Photo & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-11 w-11 shrink-0 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-100">
                            {member.photo ? (
                              <Image
                                src={member.photo}
                                alt={member.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">
                              {member.name}
                            </div>
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-50">
                              {member.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {member.category || 'General'}
                        </span>
                      </td>

                      {/* Role & Experience */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">{member.role}</div>
                        <div className="text-xs text-slate-400">
                          {member.experience ? handleYear(member.experience) : 'N/A'}
                        </div>
                      </td>

                      {/* Degree / Qualification */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">
                          {member.degree ? sanitizeDegree(member.degree) : 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            member.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Member"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(member)}
                            title={member.is_active ? 'Deactivate Member' : 'Activate Member'}
                            className={`p-2 rounded-lg transition-colors ${
                              member.is_active
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {member.is_active ? (
                              <FiSlash className="w-4 h-4" />
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      No members found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MemberModal
        isOpen={isMemberModalOpen}
        initialData={selectedMember}
        onClose={() => setIsMemberModalOpen(false)}
        onSuccess={handleMemberSuccess}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        member={selectedMember}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={handleStatusSuccess}
      />
    </main>
  );
}