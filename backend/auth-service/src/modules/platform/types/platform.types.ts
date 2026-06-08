export interface CreatePostPayload {
  authorId: number;
  caption: string;
  mediaUrl?: string;
  location?: string;
}

export interface LikePostPayload {
  userId: number;
  postId: number;
}

export interface ListFeedPayload {
  viewerId?: number;
  limit?: number;
}

export interface CreateEventPayload {
  hostId: number;
  title: string;
  description: string;
  category: string;
  venueName: string;
  address: string;
  city: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  startsAt: string;
  endsAt?: string;
  coverImageUrl?: string;
  priceCents?: number;
  currency?: string;
  capacity?: number;
}

export interface ListEventsPayload {
  city?: string;
  category?: string;
  limit?: number;
}

export interface SwipeEventPayload {
  userId: number;
  eventId: number;
  decision: 'INTERESTED' | 'NOT_INTERESTED';
}

export interface ReserveTicketPayload {
  buyerId: number;
  eventId: number;
  quantity: number;
}
