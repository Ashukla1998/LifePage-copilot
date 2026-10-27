'use client';

import Link from 'next/link';
import { FiUsers, FiFolder, FiChevronRight } from 'react-icons/fi';

const OPTIONS = [
    {
        href: '/aka-member',
        title: 'Handle Team Members',
        description: 'Add, edit and activate or deactivate team members.',
        Icon: FiUsers,
    },
    {
        href: '/aka-projects',
        title: 'Handle Projects',
        description: 'Add, edit and manage the status of projects.',
        Icon: FiFolder,
    },
];

export default function AkaDashboardPage() {
    return (
        <div className="min-h-dvh w-full bg-gray-50 flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-105 bg-[#ffc000] border-2 border-black rounded-lg p-5 sm:p-7 shadow-lg">
                <div className="text-center mb-5 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                        Welcome kapil!
                    </h2>
                    <p className="text-xs text-gray-800 mt-1 font-medium">
                        What would you like to manage?
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {OPTIONS.map(({ href, title, description, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-center gap-3 rounded-md border-2 border-black/30 bg-white p-4 shadow-md transition hover:-translate-y-0.5 hover:border-black active:scale-[0.98]"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#2196f3] text-white">
                                <Icon size={20} />
                            </span>
                            <span className="flex-1 text-left">
                                <span className="block text-sm font-bold text-gray-900">{title}</span>
                                <span className="block text-xs text-gray-600">{description}</span>
                            </span>
                            <FiChevronRight
                                size={18}
                                className="text-gray-500 transition group-hover:translate-x-0.5 group-hover:text-black"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
