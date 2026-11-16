export interface MLHEducation {
  id: string;
  current: boolean;
  school_name?: string | null;
  school_type?: string | null;
  start_date?: number | null;
  end_date?: number | null;
  major?: string | null;
}

export interface MLHProfileDetails {
  country_of_residence?: string | null;
  race_or_ethnicity?: string | null;
  gender?: string | null;
  age?: number | null;
}

export interface MLHUserProfile {
  id: string;
  created_at: number;
  updated_at: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  profile?: MLHProfileDetails | null;
  education?: MLHEducation[];
}
