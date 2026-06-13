import { ModulePage } from "../components/ModulePage";
import { PageHeader } from "@gsmaxall/ui";
import { MediaView } from "./MediaView";

export default function MediaPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Media OS"
        subtitle="Image and audio generation + understanding (services/media). Generate visuals from prompts."
      />
      <MediaView />
    </ModulePage>
  );
}
