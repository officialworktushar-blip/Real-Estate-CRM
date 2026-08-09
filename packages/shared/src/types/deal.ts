export type DealStage =
  | "lead"
  | "contacted"
  | "meeting"
  | "proposal"
  | "negotiation"
  | "under_contract"
  | "closing"
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
  actual_close_date?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
