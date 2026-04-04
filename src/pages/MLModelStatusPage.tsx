import { AppLayout } from "@/components/layout/AppLayout";
import ModelStatusCard from "@/components/model/ModelStatusCard";
import { Server } from "lucide-react";

export default function MLModelStatusPage() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            ML Model Status
          </h1>
          <p className="text-muted-foreground">
            Real-time view of the deployed scoring model, training data composition, and score blend configuration
          </p>
        </div>
        <ModelStatusCard />
      </div>
    </AppLayout>
  );
}
