import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";
import { ReactNode } from "react";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { cookies } from "next/headers";
import { Provider } from "jotai";

export const DashboardLayout = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar />
            <main className="flex flex-1 flex-col w-full h-full">
              {children}
            </main>
          </SidebarProvider>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
