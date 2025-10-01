export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-white">
            <main className="flex-1 flex flex-col">
                <div className="flex-grow bg-[#A1DBFF]">
                    {children}
                </div>
            </main>
        </div>
    );
}