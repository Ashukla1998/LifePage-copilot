'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const VALID_MEMBER_ID = '6d318c2e86f30a13cc0f6266a73514a0';

// Only the AKA admin account may open the AKA management pages
export default function AkaGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthReady, isLoggedIn, user } = useAuth();
    const isAllowed = isLoggedIn && user?.memberid === VALID_MEMBER_ID;

    useEffect(() => {
        if (isAuthReady && !isAllowed) {
            router.replace('/aka');
        }
    }, [isAuthReady, isAllowed, router]);

    if (!isAllowed) {
        return (
            <div className="flex justify-center items-center min-h-screen font-sans">
                Loading...
            </div>
        );
    }

    return <>{children}</>;
}
