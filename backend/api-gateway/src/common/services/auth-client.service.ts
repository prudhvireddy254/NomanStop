import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import type { Command } from '../constants/commands';
import { AUTH_SERVICE_CLIENT } from '../constants/microservice.constants';
import type { MicroserviceError } from '../types/microservice.types';

function isMicroserviceError(res: unknown): res is MicroserviceError {
  return typeof res === 'object' && res !== null && 'error' in res;
}

@Injectable()
export class AuthClientService {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  /** Send a TCP command to auth-service. Returns data or throws the error string. */
  async send<T>(cmd: Command, payload?: unknown): Promise<T> {
    const response = await firstValueFrom(
      this.client.send<unknown>({ cmd }, payload),
    );

    if (isMicroserviceError(response)) {
      throw new Error(response.error);
    }

    return response as T;
  }
}
