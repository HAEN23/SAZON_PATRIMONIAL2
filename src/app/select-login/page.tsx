"use client";

import { useRouter } from "next/navigation";
import styles from "./select-login.module.css";

export default function SelectLogin() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <section className={styles.choose}>
        <img
          src="/images/logo_sp_rojo.png"
          className={styles.logo}
          width={100}
          alt="Logo Sazón Patrimonial"
        />

        <h4 className={styles.title}>Ingresar como</h4>

        <button
          className={styles.button}
          onClick={() => router.push("/login-admin")}
        >
          <img
            src="/images/admin_logo.png"
            className={styles.icon}
            width={24}
            alt="Administrador"
          />
          Administrador
        </button>

        <button
          className={styles.button}
          onClick={() => router.push("/login-rest")}
        >
          <img
            src="/images/rest_logo.png"
            className={styles.icon}
            width={24}
            alt="Restaurantero"
          />
          Restaurantero
        </button>

        <a
          className={styles.registerLink}
          onClick={() => router.push("/registro")}
        >
          Registrarse
        </a>
      </section>
    </div>
  );
}
