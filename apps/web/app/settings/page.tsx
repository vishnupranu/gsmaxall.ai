import { ModulePage } from "../components/ModulePage";
import { PageHeader } from "@gsmaxall/ui";
import { SettingsView } from "./SettingsView";

export default function SettingsPage() {
  return (
    <ModulePage>
      <PageHeader title="Settings" subtitle="Runtime mode, appearance, and AI provider configuration." />
      <SettingsView />
    </ModulePage>
  );
}
