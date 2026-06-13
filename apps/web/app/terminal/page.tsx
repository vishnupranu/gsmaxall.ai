import { ModulePage } from "../components/ModulePage";
import { PageHeader } from "@gsmaxall/ui";
import { TerminalView } from "./TerminalView";

export default function TerminalPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Terminal OS"
        subtitle="Sandboxed shell exposed by the agent runtime (services/agents). This demo simulates a few commands."
      />
      <TerminalView />
    </ModulePage>
  );
}
