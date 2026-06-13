import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader } from "@gsmaxall/ui";

export default function BuilderPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Builder OS"
        subtitle="Generate apps and sites from a prompt (Lovable/Bolt-style). Describe what you want and get a build plan and starter code."
      />
      <PromptWorkspace
        runLabel="Build"
        placeholder="e.g. A landing page for a SaaS product with hero, pricing, and a contact form"
        systemPrompt="You are GSMAXALL Builder OS. Given a product idea, output a recommended stack, a file/folder structure, and the key starter components as code blocks. Keep it runnable and minimal."
      />
    </ModulePage>
  );
}
