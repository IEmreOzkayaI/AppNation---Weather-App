export interface Venue {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  coverImage: string;
  images: string[];
  reelsUrls: string[];
  musicGenre: string;
  audioProfile: string; // "canli DJ" | "ambient" | "eglenceli" etc
  playlistUrl?: string;
  dressCode: 'casual' | 'smart casual' | 'formal';
  noiseLevel: number; // 1-5
  crowdWeekday: 'sakin' | 'orta' | 'kalabalik';
  crowdWeekend: 'sakin' | 'orta' | 'kalabalik';
  priceRange: 1 | 2 | 3 | 4; // TL to TLTLTLTL
  vibe: string[]; // tags like "hipster", "luks", "rahat", etc
  idealTime: string[]; // "sabah" | "oglen" | "aksam" | "gece"
  hours: string;
  phone?: string;
  website?: string;
  reservationUrl?: string;
  entryDifficulty: 'kolay' | 'orta' | 'zor';
  checkInCount: number;
  vibeMatchPercent: number;
  tags: string[]; // "date night", "work meeting", etc
  status: 'public' | 'private' | 'pending';
  comments: Comment[];
  addedBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  vibeRating: number;
  createdAt: string;
}

export interface VenueList {
  id: string;
  name: string;
  description?: string;
  venueIds: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  lists: VenueList[];
  savedVenueIds: string[];
  following: number;
  followers: number;
}
