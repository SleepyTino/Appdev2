import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
        <TopBar userName={userName} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
