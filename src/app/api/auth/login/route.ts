import { NextRequest, NextResponse } from 'next/server';
import { LoginUseCase } from '@/core/application/use-cases/auth/Login.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '@/core/infrastructure/auth/BcryptPasswordHasher';
import { JwtService } from '@/core/infrastructure/auth/JwtService';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
  tipo: z.enum(['admin', 'restaurantero', 'cliente']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar entrada
    const validatedData = LoginSchema.parse(body);

    // Instanciar dependencias
    const userRepository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasher();
    const jwtService = new JwtService();

    // Ejecutar caso de uso
    const loginUseCase = new LoginUseCase(userRepository, passwordHasher);
    const result = await loginUseCase.execute({
      email: validatedData.email,
      password: validatedData.password,
    });

    // Validar tipo de usuario si se especificó
    if (validatedData.tipo) {
      const expectedType = validatedData.tipo === 'cliente' ? 'cliente' : validatedData.tipo;
      if (result.user.type !== expectedType) {
        throw new UnauthorizedException(
          `Este usuario no está registrado como ${validatedData.tipo}`
        );
      }
    }

    // Generar token JWT
    const token = jwtService.generateToken({
      userId: result.user.id,
      email: result.user.email,
      type: result.user.type,
    });

    // Crear respuesta con cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: result.user,
          token,
        },
      },
      { status: 200 }
    );

    // Cookie específica según tipo de usuario
    const cookieName =
      result.user.type === UserType.CLIENT ? 'client-auth-token' : 'auth-token';
    const maxAge =
      result.user.type === UserType.CLIENT
        ? 60 * 60 * 24 * 30 // 30 días para clientes
        : 60 * 60 * 24 * 7; // 7 días para admin/restaurantero

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);

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

    if (error instanceof UnauthorizedException) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 401 }
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

// Verificar sesión
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    const clientToken = request.cookies.get('client-auth-token')?.value;
    const token = authToken || clientToken;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No hay sesión activa',
        },
        { status: 401 }
      );
    }

    const jwtService = new JwtService();
    const payload = jwtService.verifyToken(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: payload,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Sesión inválida o expirada',
      },
      { status: 401 }
    );
  }
}

// Logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Sesión cerrada exitosamente',
    },
    { status: 200 }
  );

  response.cookies.delete('auth-token');
  response.cookies.delete('client-auth-token');

  return response;
}