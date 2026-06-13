import { ModulePage } from "../components/ModulePage";
import { PageHeader } from "@gsmaxall/ui";
import { MemoryView } from "./MemoryView";

export default function MemoryPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Memory OS"
        subtitle="Long-term and semantic memory backed by Qdrant. Agents recall context across sessions."
      />
      <MemoryView />
    </ModulePage>
  );
}
