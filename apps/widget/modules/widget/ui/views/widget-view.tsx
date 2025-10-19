"use client";

import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { screenAtom } from "../../atoms/widget-atom";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";

interface Props {
  organizationId: string | null;
}

export const WidgetView: React.FC<Props> = ({ organizationId }) => {

  const screen = useAtomValue(screenAtom);

  const screenComponent = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId}/>,
    auth: <WidgetAuthScreen />,
    voice: <p>TODO: VOICE</p>,
    inbox: <p>TODO: INBOX</p>,
    selection: <p>TODO: SELECTION</p>,
    chat: <p>TODO: CHAT</p>,
    contact: <p>TODO: CONTACT</p>
  }

  return (
    <main className="min-h-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponent[screen]}
    </main>
  );
};
