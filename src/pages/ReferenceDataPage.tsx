import React from 'react';
import { Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';
import HighRiskCountriesTab from '@/components/reference/HighRiskCountriesTab';
import HighRiskLocationsTab from '@/components/reference/HighRiskLocationsTab';
import IndustryRiskTab from '@/components/reference/IndustryRiskTab';
import SanctionedCountriesTab from '@/components/reference/SanctionedCountriesTab';

export default function ReferenceDataPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Reference Data Management</h1>
            <p className="text-xs text-muted-foreground">Configure risk parameters that feed into the AML scoring engine</p>
          </div>
        </div>

        <Tabs defaultValue="countries" className="space-y-4">
          <TabsList className="h-8">
            <TabsTrigger value="countries" className="text-xs h-7 px-3">High-Risk Countries</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs h-7 px-3">High-Risk Locations (India)</TabsTrigger>
            <TabsTrigger value="industries" className="text-xs h-7 px-3">Industry Risk Scores</TabsTrigger>
            <TabsTrigger value="sanctioned" className="text-xs h-7 px-3">Sanctioned Countries</TabsTrigger>
          </TabsList>

          <TabsContent value="countries"><HighRiskCountriesTab /></TabsContent>
          <TabsContent value="locations"><HighRiskLocationsTab /></TabsContent>
          <TabsContent value="industries"><IndustryRiskTab /></TabsContent>
          <TabsContent value="sanctioned"><SanctionedCountriesTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
