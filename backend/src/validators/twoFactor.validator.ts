import { IsString, Length, Matches } from 'class-validator';

export class TwoFactorTokenDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, {
    message: 'Token deve conter apenas números',
  })
  token!: string;
}

export class TwoFactorVerifyDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, {
    message: 'Token deve conter apenas números',
  })
  token!: string;
}

export class BackupCodeDto {
  @IsString()
  @Length(8, 8)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Código de backup deve conter apenas letras maiúsculas e números',
  })
  code!: string;
} 