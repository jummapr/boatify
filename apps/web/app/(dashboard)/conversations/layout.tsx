import { ConversationLayout } from "@/modules/dashboard/ui/layout/conversation-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <ConversationLayout>{children}</ConversationLayout>
};

export default Layout;
