import { getControlStatus } from "@/lib/dromocob-control";

import MaintenanceScreen from "./maintenance-screen";
import DisabledScreen from "./disabled-screen";

export default async function ControlGate({
  children,
}) {
  const status = await getControlStatus();

  if (status === "maintenance") {
    return <MaintenanceScreen />;
  }

  if (status === "disabled") {
    return <DisabledScreen />;
  }

  return <>{children}</>;
}