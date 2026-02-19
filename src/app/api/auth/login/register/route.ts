import { NextRequest, NextResponse } from 'next/server';
import { RegisterUseCase } from '@/core/application/use-cases/auth/Register.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaAdministratorRepository } from '@/core/infrastructure/database/repositories/PrismaAdministratorRepository';
import { PrismaRestaurantOwnerRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantOwnerRepository';
import { BcryptPasswordHasher } from '@/core/infrastructure/auth/BcryptPasswordHasher';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  type: z.enum(['admin', 'restaurantero'], {
    errorMap: () => ({ message: 'Tipo de usuario inválido' }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar entrada
    const validatedData = RegisterSchema.parse(body);

    // Instanciar dependencias
    const userRepository = new PrismaUserRepository();
    const administratorRepository = new PrismaAdministratorRepository();
    const restaurantOwnerRepository = new PrismaRestaurantOwnerRepository();
    const passwordHasher = new BcryptPasswordHasher();

    // Ejecutar caso de uso
    const registerUseCase = new RegisterUseCase(
      userRepository,
      administratorRepository,
      restaurantOwnerRepository,
      passwordHasher
    );

    const user = await registerUseCase.execute({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      type: validatedData.type as UserType,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            type: user.type,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en register:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof ConflictException) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 }
      );
    }

    if (error instanceof ValidationException) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}