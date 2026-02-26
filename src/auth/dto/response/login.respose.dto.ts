import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class LoginResponse {
  @IsNumber()
  document: number;

  @IsString()
  @ApiProperty({
    description: "JWT access token requerido para requests autenticados.",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yQeXzlhoJZU",
  })
  access_token: string;
}
