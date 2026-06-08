import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateEventPayload,
  CreatePostPayload,
  LikePostPayload,
  ListEventsPayload,
  ListFeedPayload,
  ReserveTicketPayload,
  SwipeEventPayload,
} from './types/platform.types';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async listFeed(data: ListFeedPayload = {}) {
    const limit = this.limit(data.limit);

    return this.prisma.post.findMany({
      where: { visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            isVerified: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async createPost(data: CreatePostPayload) {
    const caption = typeof data?.caption === 'string' ? data.caption.trim() : '';

    if (!data?.authorId) return { error: 'Author is required.' };
    if (!caption) return { error: 'Caption is required.' };

    return this.prisma.post.create({
      data: {
        authorId: data.authorId,
        caption,
        mediaUrl: this.optionalString(data.mediaUrl),
        location: this.optionalString(data.location),
      },
    });
  }

  async likePost(data: LikePostPayload) {
    if (!data?.userId || !data?.postId) {
      return { error: 'User and post are required.' };
    }

    const like = await this.prisma.postLike.upsert({
      where: {
        postId_userId: {
          postId: data.postId,
          userId: data.userId,
        },
      },
      update: {},
      create: {
        postId: data.postId,
        userId: data.userId,
      },
    });

    return { message: 'Post liked.', like };
  }

  async listEvents(data: ListEventsPayload = {}) {
    const limit = this.limit(data.limit);
    const now = new Date();

    return this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startsAt: { gte: now },
        city: data.city ? { equals: data.city, mode: 'insensitive' } : undefined,
        category: data.category
          ? { equals: data.category, mode: 'insensitive' }
          : undefined,
      },
      orderBy: { startsAt: 'asc' },
      take: limit,
      include: {
        host: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
            isVerified: true,
          },
        },
        _count: { select: { swipes: true, ticketOrders: true } },
      },
    });
  }

  async createEvent(data: CreateEventPayload) {
    const required = [
      data?.hostId,
      data?.title,
      data?.description,
      data?.category,
      data?.venueName,
      data?.address,
      data?.city,
      data?.startsAt,
    ];

    if (required.some((value) => value === undefined || value === '')) {
      return { error: 'Host, title, description, category, venue, address, city, and start time are required.' };
    }

    const startsAt = new Date(data.startsAt);
    const endsAt = data.endsAt ? new Date(data.endsAt) : undefined;

    if (Number.isNaN(startsAt.getTime())) {
      return { error: 'startsAt must be a valid date.' };
    }
    if (endsAt && Number.isNaN(endsAt.getTime())) {
      return { error: 'endsAt must be a valid date.' };
    }

    const capacity = this.optionalPositiveInt(data.capacity);

    return this.prisma.event.create({
      data: {
        hostId: data.hostId,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        venueName: data.venueName.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        region: this.optionalString(data.region),
        country: this.optionalString(data.country) ?? 'US',
        latitude: this.optionalNumber(data.latitude),
        longitude: this.optionalNumber(data.longitude),
        startsAt,
        endsAt,
        coverImageUrl: this.optionalString(data.coverImageUrl),
        priceCents: this.optionalPositiveInt(data.priceCents) ?? 0,
        currency: this.optionalString(data.currency) ?? 'USD',
        capacity,
        ticketsAvailable: capacity,
      },
    });
  }

  async swipeEvent(data: SwipeEventPayload) {
    if (!data?.userId || !data?.eventId) {
      return { error: 'User and event are required.' };
    }
    if (!['INTERESTED', 'NOT_INTERESTED'].includes(data.decision)) {
      return { error: 'Swipe decision is invalid.' };
    }

    const swipe = await this.prisma.eventSwipe.upsert({
      where: {
        eventId_userId: {
          eventId: data.eventId,
          userId: data.userId,
        },
      },
      update: { decision: data.decision },
      create: {
        eventId: data.eventId,
        userId: data.userId,
        decision: data.decision,
      },
    });

    return { message: 'Event preference saved.', swipe };
  }

  async reserveTicket(data: ReserveTicketPayload) {
    const quantity = this.optionalPositiveInt(data?.quantity) ?? 1;

    if (!data?.buyerId || !data?.eventId) {
      return { error: 'Buyer and event are required.' };
    }

    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event || event.status !== 'PUBLISHED') {
      return { error: 'Event is not available.' };
    }
    if (event.ticketsAvailable !== null && event.ticketsAvailable < quantity) {
      return { error: 'Not enough tickets available.' };
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.ticketOrder.create({
        data: {
          eventId: data.eventId,
          buyerId: data.buyerId,
          quantity,
          totalCents: event.priceCents * quantity,
          currency: event.currency,
        },
      });

      if (event.ticketsAvailable !== null) {
        await tx.event.update({
          where: { id: event.id },
          data: { ticketsAvailable: event.ticketsAvailable - quantity },
        });
      }

      return { message: 'Ticket reserved.', order };
    });
  }

  private limit(value: unknown): number {
    return typeof value === 'number' && value > 0 && value <= 100 ? value : 25;
  }

  private optionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private optionalNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }

  private optionalPositiveInt(value: unknown): number | undefined {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      return undefined;
    }
    return value;
  }
}
