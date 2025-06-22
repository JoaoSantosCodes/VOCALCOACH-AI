import { z } from 'zod';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  vocalRange: z.object({
    lowest: z.number(),
    highest: z.number(),
  }).optional(),
  preferences: z.object({
    favoriteGenres: z.array(z.string()),
    practiceReminders: z.boolean(),
    dailyGoalMinutes: z.number().min(5).max(240),
  }).optional(),
});

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  confirmPassword?: string;
}

// Funções de validação para compatibilidade
export const validateLogin = (data: any) => {
  const loginDto = new LoginDto();
  Object.assign(loginDto, data);
  return loginDto;
};

export const validateRegister = (data: any) => {
  const registerDto = new RegisterDto();
  Object.assign(registerDto, data);
  return registerDto;
}; 