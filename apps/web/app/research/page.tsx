import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader } from "@gsmaxall/ui";

export default function ResearchPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Research OS"
        subtitle="Deep, multi-step research with sourced synthesis. Ask a question and get a structured, cited report."
      />
      <PromptWorkspace
        runLabel="Research"
        placeholder="e.g. Compare vector databases for agent memory: Qdrant vs pgvector vs Milvus"
        systemPrompt="You are GSMAXALL Research OS. Produce a structured research brief: a short executive summary, key findings as bullet points, trade-offs, and a 'sources to verify' section. Be objective and concise."
      />
    </ModulePage>
  );
}
