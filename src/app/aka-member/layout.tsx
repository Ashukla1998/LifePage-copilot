import AkaGuard from '../aka/AkaGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AkaGuard>{children}</AkaGuard>;
}
