"use client";

// import { WidgetFooter } from "../components/widget-footer";
// import { WidgetHeader } from "../components/widget-header";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";

interface Props {
  organizationId: string;
}

export const WidgetView: React.FC<Props> = ({ organizationId }) => {
  return (
    <main className="min-h-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />
      {/* <WidgetFooter /> */}
    </main>
  );
};
