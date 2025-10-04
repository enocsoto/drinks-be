import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Strategy } from '../enum/strategyes.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard(Strategy.JWT) {}
