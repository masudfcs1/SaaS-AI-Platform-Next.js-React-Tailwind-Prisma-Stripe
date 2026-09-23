import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function DashboardPage() {
  return <ChatWorkspace key="dashboard" mode="conversation" overview={true} />;
}
