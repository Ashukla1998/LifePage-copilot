'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiPlus, FiSearch, FiCheck, FiSlash } from 'react-icons/fi';
import { AkaMember, AkaMemberFormData } from './types';
import MemberModal from './components/MemberModal';
import StatusModal from './components/StatusModal';

const INITIAL_MEMBERS: AkaMember[] = [
    {
        memberid: 101,
        name: 'Dr. Arjun Verma',
        role: 'Lead Mentor',
        photo: 'https://placehold.co/150x150?text=AV',
        degree: ['B.Tech', 'Ph.D in AI'],
        experience: '8+ Years',
        is_active: true,
        description: 'Expert in career strategy and computational technology.',
    },
    {
        memberid: 102,
        name: 'Priya Sharma',
        role: 'Career Consultant',
        photo: 'https://placehold.co/150x150?text=PS',
        degree: ['MBA', 'B.Com'],
        experience: '5 Years',
        is_active: false,
        description: 'Specializes in higher education paths and corporate coaching.',
    },
];

export default function AkaMemberPage() {
    const [members, setMembers] = useState<AkaMember[]>(INITIAL_MEMBERS);
    const [search, setSearch] = useState('');

    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<AkaMember | null>(null);

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

    const handleMemberSuccess = (savedMember: AkaMember) => {
        if (selectedMember) {
            // Update existing member in state
            setMembers((prev) =>
                prev.map((m) => (m.memberid === savedMember.memberid ? savedMember : m))
            );
        } else {
            // Prepend newly inserted member returned from database
            setMembers((prev) => [savedMember, ...prev]);
        }
    };

    const handleSaveMember = (data: AkaMemberFormData) => {
        const degreesArray = data.degree
            ? data.degree.split(',').map((d) => d.trim()).filter(Boolean)
            : [];

        if (selectedMember) {
            setMembers((prev) =>
                prev.map((m) =>
                    m.memberid === selectedMember.memberid
                        ? {
                            ...m,
                            name: data.name,
                            role: data.role,
                            photo:
                                data.photo.trim() ||
                                m.photo ||
                                `https://placehold.co/150x150?text=${data.name.charAt(0).toUpperCase()}`,
                            degree: degreesArray,
                            experience: data.experience,
                            description: data.description,
                        }
                        : m
                )
            );
        } else {
            const newMember: AkaMember = {
                memberid: Date.now(),
                name: data.name,
                role: data.role,
                photo:
                    data.photo.trim() ||
                    `https://placehold.co/150x150?text=${data.name.charAt(0).toUpperCase()}`,
                degree: degreesArray,
                experience: data.experience,
                description: data.description,
                is_active: true,
            };
            setMembers((prev) => [newMember, ...prev]);
        }
        setIsMemberModalOpen(false);
    };

    const handleToggleStatusConfirm = () => {
        if (!selectedMember) return;
        setMembers((prev) =>
            prev.map((m) =>
                m.memberid === selectedMember.memberid
                    ? { ...m, is_active: !m.is_active }
                    : m
            )
        );
        setIsStatusModalOpen(false);
        setSelectedMember(null);
    };

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.role.toLowerCase().includes(search.toLowerCase()) ||
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
                                placeholder="Search by name, role, or bio..."
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
                                                        <Image
                                                            src={member.photo}
                                                            alt={member.name}
                                                            fill
                                                            sizes="44px"
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 leading-snug">
                                                            {member.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">
                                                            {member.description || 'No description provided'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role & Experience */}
                                            <td className="px-6 py-4">
                                                <div className="text-slate-800 font-medium text-sm">{member.role}</div>
                                                <div className="text-xs text-slate-400">{member.experience || 'N/A'}</div>
                                            </td>

                                            {/* Degrees / Qualifications */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                    {member.degree && member.degree.length > 0 ? (
                                                        member.degree.map((deg, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
                                                            >
                                                                {deg}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${member.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                                                            }`}
                                                    />
                                                    {member.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        // onClick={() => handleOpenEdit(member)}
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Member"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        // onClick={() => handleOpenStatusModal(member)}
                                                        title={member.is_active ? 'Deactivate Member' : 'Activate Member'}
                                                        className={`p-2 rounded-lg transition-colors ${member.is_active
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
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
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

            {/* <StatusModal
                isOpen={isStatusModalOpen}
                member={selectedMember}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleToggleStatusConfirm}
            /> */}
        </main>
    );
}