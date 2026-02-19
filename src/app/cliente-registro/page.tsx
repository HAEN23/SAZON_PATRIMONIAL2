'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './cliente-registro.module.css';
import Link from 'next/link';

interface FormData {
  nombre: string;
  correo: string;
  contrasena: string;
  confirmarContrasena: string;
  telefono: string;
}

interface FormErrors {
  nombre?: string;
  correo?: string;
  contrasena?: string;
  confirmarContrasena?: string;
  telefono?: string;
  general?: string;
}

export default function ClienteRegistro() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.telefono && !/^[0-9]{10}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    // Validar contraseña
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es obligatoria';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/cliente/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          correo: formData.correo.trim().toLowerCase(),
          contrasena: formData.contrasena,
          telefono: formData.telefono.trim() || null,
          tipo: 'cliente',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar');
      }

      // Registro exitoso
      alert('¡Registro exitoso! Ahora puedes iniciar sesión');
      router.push('/cliente-login');
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al registrar. Intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <span>🍽️</span>
          </div>
          <div className={styles.logoText}>
            <h1>Sazón Patrimonial</h1>
            <p>Catálogo de Restaurantes en Chiapa de Corzo</p>
          </div>
        </div>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Crear Cuenta de Cliente</h2>
          <p className={styles.subtitle}>
            Regístrate para guardar tus restaurantes favoritos y descargar menús
          </p>

          {errors.general && (
            <div className={styles.errorAlert}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Nombre completo */}
            <div className={styles.formGroup}>
              <label htmlFor="nombre" className={styles.label}>
                Nombre completo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
                placeholder="Juan Pérez"
                disabled={isLoading}
              />
              {errors.nombre && (
                <span className={styles.errorMessage}>{errors.nombre}</span>
              )}
            </div>

            {/* Correo electrónico */}
            <div className={styles.formGroup}>
              <label htmlFor="correo" className={styles.label}>
                Correo electrónico <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                placeholder="correo@ejemplo.com"
                disabled={isLoading}
              />
              {errors.correo && (
                <span className={styles.errorMessage}>{errors.correo}</span>
              )}
            </div>

            {/* Teléfono */}
            <div className={styles.formGroup}>
              <label htmlFor="telefono" className={styles.label}>
                Teléfono <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
                placeholder="9611234567"
                disabled={isLoading}
              />
              {errors.telefono && (
                <span className={styles.errorMessage}>{errors.telefono}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className={styles.formGroup}>
              <label htmlFor="contrasena" className={styles.label}>
                Contraseña <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="contrasena"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.contrasena ? styles.inputError : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.contrasena && (
                <span className={styles.errorMessage}>{errors.contrasena}</span>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmarContrasena" className={styles.label}>
                Confirmar contraseña <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.confirmarContrasena ? styles.inputError : ''}`}
                  placeholder="Repite tu contraseña"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmarContrasena && (
                <span className={styles.errorMessage}>{errors.confirmarContrasena}</span>
              )}
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link href="/cliente-login" className={styles.link}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}