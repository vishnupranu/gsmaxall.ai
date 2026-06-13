import { ModulePage } from "../components/ModulePage";
import { PageHeader } from "@gsmaxall/ui";
import { WorkflowView } from "./WorkflowView";

export default function WorkflowsPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Workflow OS"
        subtitle="Automate multi-step tasks with triggers and schedules (services/workflows + Redis). Build a flow below."
      />
      <WorkflowView />
    </ModulePage>
  );
}
