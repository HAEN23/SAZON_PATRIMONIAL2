'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';

export default function SelectLogin() {
  const router = useRouter();

  const handleSelectUserType = (type: 'admin' | 'restaurantero' | 'cliente') => {
    // Redirigir a login con el tipo como query param
    router.push(`/login?tipo=${type}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🍽️</span>
        </div>
        <h1 className={styles.title}>Sazón Patrimonial</h1>
      </div>

      <h2 className={styles.subtitle}>Ingresar como</h2>

      <div className={styles.optionsContainer}>
        <button
          className={`${styles.optionButton} ${styles.admin}`}
          onClick={() => handleSelectUserType('admin')}
        >
          <div className={styles.iconWrapper}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2Z"
                fill="currentColor"
              />
              <path
                d="M12 9C8.13401 9 5 10.567 5 12.5V14H19V12.5C19 10.567 15.866 9 12 9Z"
                fill="currentColor"
              />
              <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M18 16V20M16 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className={styles.optionText}>Administrador</span>
        </button>

        <button
          className={`${styles.optionButton} ${styles.restaurantero}`}
          onClick={() => handleSelectUserType('restaurantero')}
        >
          <div className={styles.iconWrapper}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path
                d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className={styles.optionText}>Restaurantero</span>
        </button>

        <button
          className={`${styles.optionButton} ${styles.usuario}`}
          onClick={() => handleSelectUserType('cliente')}
        >
          <div className={styles.iconWrapper}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className={styles.optionText}>Usuario</span>
        </button>
      </div>

      <div className={styles.footer}>
        <p>¿No tienes cuenta?</p>
        <button
          className={styles.registerLink}
          onClick={() => router.push('/registro')}
        >
          Regístrate aquí
        </button>
      </div>
    </div>
  );
}