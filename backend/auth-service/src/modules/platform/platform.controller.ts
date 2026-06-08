import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { Commands } from '../../common/constants/commands';
import { PlatformService } from './platform.service';
import type {
  CreateEventPayload,
  CreatePostPayload,
  LikePostPayload,
  ListEventsPayload,
  ListFeedPayload,
  ReserveTicketPayload,
  SwipeEventPayload,
} from './types/platform.types';

@Controller()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @MessagePattern({ cmd: Commands.LIST_FEED })
  listFeed(data: ListFeedPayload) {
    return this.platformService.listFeed(data);
  }

  @MessagePattern({ cmd: Commands.CREATE_POST })
  createPost(data: CreatePostPayload) {
    return this.platformService.createPost(data);
  }

  @MessagePattern({ cmd: Commands.LIKE_POST })
  likePost(data: LikePostPayload) {
    return this.platformService.likePost(data);
  }

  @MessagePattern({ cmd: Commands.LIST_EVENTS })
  listEvents(data: ListEventsPayload) {
    return this.platformService.listEvents(data);
  }

  @MessagePattern({ cmd: Commands.CREATE_EVENT })
  createEvent(data: CreateEventPayload) {
    return this.platformService.createEvent(data);
  }

  @MessagePattern({ cmd: Commands.SWIPE_EVENT })
  swipeEvent(data: SwipeEventPayload) {
    return this.platformService.swipeEvent(data);
  }

  @MessagePattern({ cmd: Commands.RESERVE_TICKET })
  reserveTicket(data: ReserveTicketPayload) {
    return this.platformService.reserveTicket(data);
  }
}
