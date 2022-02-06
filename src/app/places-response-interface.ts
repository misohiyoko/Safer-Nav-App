export interface placesResponse {
  html_attributions: any[];
  next_page_token:   string;
  results:           PlacesResult[];
  status:            string;
}

export interface PlacesResult {
  geometry:              Geometry;
  icon:                  string;
  icon_background_color: IconBackgroundColor;
  icon_mask_base_uri:    string;
  name:                  string;
  photos:                Photo[];
  place_id:              string;
  reference:             string;
  scope:                 Scope;
  types:                 string[];
  vicinity:              string;
  business_status?:      BusinessStatus;
  opening_hours?:        OpeningHours;
  plus_code?:            PlusCode;
  price_level?:          number;
  rating?:               number;
  user_ratings_total?:   number;
}

export enum BusinessStatus {
  Operational = "OPERATIONAL",
}

export interface Geometry {
  location: Location;
  viewport: Viewport;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Viewport {
  northeast: Location;
  southwest: Location;
}

export enum IconBackgroundColor {
  Ff9E67 = "#FF9E67",
  The7B9Eb0 = "#7B9EB0",
  The909Ce1 = "#909CE1",
}

export interface OpeningHours {
  open_now: boolean;
}

export interface Photo {
  height:            number;
  html_attributions: HtmlAttribution[];
  photo_reference:   string;
  width:             number;
}

export enum HtmlAttribution {
  Empty = " ",
}

export interface PlusCode {
  compound_code: string;
  global_code:   string;
}

export enum Scope {
  Google = "GOOGLE",
}
