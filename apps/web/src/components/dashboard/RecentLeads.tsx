import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

interface LeadItem {
  id: string;
  full_name: string;
  status: string;
  source: string;
  created_at: string;
}

export function RecentLeads({ leads }: { leads: LeadItem[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Recent Leads</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leads.slice(0, 5).map((lead) => (
            <div key={lead.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{lead.full_name}</p>
                <p className="text-xs text-gray-500">{lead.source}</p>
              </div>
              <Badge variant={lead.status === "new" ? "info" : lead.status === "qualified" ? "success" : "default"}>
                {lead.status}
              </Badge>
            </div>
          ))}
          {leads.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No leads yet</p>}
        </div>
      </CardContent>
    </Card>
  );
}
