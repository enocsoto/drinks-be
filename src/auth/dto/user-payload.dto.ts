import { ApiProperty } from '@nestjs/swagger';

export class UserPayload {
  id: string;

  @ApiProperty({ description: 'MongoDB ObjectId del usuario' })
  sub: string;

  @ApiProperty({ description: 'Correo del usuario' })
  email: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  name: string;

  @ApiProperty({ description: 'Rol del usuario', default: 'client' })
  role: string;

  iat?: number;
  exp?: number;
}
