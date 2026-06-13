import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader } from "@gsmaxall/ui";

export default function DeveloperPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Developer OS"
        subtitle="Autonomous coding powered by the OpenHands runtime. Describe a task and the agent plans, edits the repo in a sandbox, and opens a PR."
      />
      <PromptWorkspace
        runLabel="Plan task"
        placeholder="e.g. Add a /healthz endpoint to the API and write a test for it"
        systemPrompt="You are GSMAXALL Developer OS, an autonomous software engineer. Given a task, produce a concise numbered execution plan (files to change, commands to run, tests to add), then a short summary. Be precise and practical."
      />
    </ModulePage>
  );
}
