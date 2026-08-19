export type DealStage =
  | "lead"
  | "proposal"
  | "negotiation"
  | "contract"
  | "closed_won"
  | "closed_lost";

export interface Deal {
  id: string;
  org_id: string;
  title: string;
  lead_id: string;
  property_id?: string;
  stage: DealStage;
  value: number;
  expected_close_date?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
