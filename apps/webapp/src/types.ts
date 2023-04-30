export interface JwtUser {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  exp: number;
  iat: number;
  email: string;
  avatar?: string;
  name: string;
  email_verified: boolean;
  session_id?: string;
  sign_in_provider: string;
}

export interface Idea {
  activity_name: string;
  short_description: string;
  location: string;
}

export interface WeightedPlace extends Place {
  weightedRating: number;
}

export interface Event {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  slug: string;
  total_seats: number;
  booked_seats: number;
  start_date?: string;
  end_date?: string;
  location_name?: string;
  area_name?: string;
  formatted_address?: string;
  longitude?: number;
  latitude?: number;
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: string;
  created_at: string;
  updated_at: string;
  is_draft?: boolean;
}


export interface IdeaWithPlaces {
  idea: Idea;
  places: WeightedPlace[];
}

export interface IdeaWithPlace {
  idea: Idea;
  place: WeightedPlace;
}

export interface OpenAIResponse {
  choices?: { text: string }[];
}

export interface Place {
  name: string;
  formatted_address: string;
  location_link: string;
  rating: number;
  user_ratings_total: number;
  photos: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  },
  bookedmarked?: boolean,
  
}

export type TextSearchResponse = {
  results: Place[];
  status: string;
};

export interface FormItem {
  key: string;
  label: string;
  inputType: string;
  onChange?: any;
  editable: boolean;
  column?: boolean;
  options?: Array<{ value: string | boolean; label: string }>;
}

export type RequestedEvent = {
  id: string;
  name: string;
  status: "pending" | "accepted" | "rejected";
  created_at?: Date;
  updated_at?: Date;
};

export type UserRequest = {
  id: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  name: string;
  email: string;
  avatarUrl?: string;
  joined?: string;
  created_at?: string;
  updated_at?: string;
};
