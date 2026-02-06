export interface ReturnReportSettings {
  id: string;
  google_meet_url: string | null;
  meet_title: string | null;
  meet_description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface ReturnReportRecording {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string | null;
  external_url: string | null;
  recording_date: string;
  duration: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
