import { ModulePage } from "../components/ModulePage";
import { PageHeader } from "@gsmaxall/ui";
import { KnowledgeView } from "./KnowledgeView";

export default function KnowledgePage() {
  return (
    <ModulePage>
      <PageHeader
        title="Knowledge OS"
        subtitle="Create knowledge bases, upload documents, and ground chat answers with citations (RAG via services/rag + Qdrant)."
      />
      <KnowledgeView />
    </ModulePage>
  );
}
