import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader } from "@gsmaxall/ui";

export default function ContentPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Content OS"
        subtitle="Long-form writing and content generation — drafts, rewrites, and edits in your brand voice."
      />
      <PromptWorkspace
        runLabel="Generate"
        placeholder="e.g. Write a launch announcement for GSMAXALL, the unified AI operating system"
        systemPrompt="You are GSMAXALL Content OS, an expert writer. Produce clear, engaging, well-structured content. Match the requested format and tone."
      />
    </ModulePage>
  );
}
