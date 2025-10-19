"use client";

import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { screenAtom } from "../../atoms/widget-atom";

interface Props {
  organizationId: string;
}

export const WidgetView: React.FC<Props> = ({ organizationId }) => {

  const screen = useAtomValue(screenAtom);

  const screenComponent = {
    error: <div>TODO: ERROR</div>,
    loading: <div>TODO: LOADING</div>,
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
