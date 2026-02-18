"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorContrasena, setErrorContrasena] = useState("");

  function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let valido = true;
    setErrorCorreo("");
    setErrorContrasena("");

    if (!correo.trim()) {
      setErrorCorreo("*Este campo es obligatorio.");
      valido = false;
    } else if (!isValidEmail(correo)) {
      setErrorCorreo("*Ingrese un correo electrónico válido.");
      valido = false;
    }

    if (!contrasena.trim()) {
      setErrorContrasena("*Este campo es obligatorio.");
      valido = false;
    } else if (contrasena.length < 6) {
      setErrorContrasena("*La contraseña debe tener al menos 6 caracteres.");
      valido = false;
    }

    if (!valido) return;

    try {
      const response = await fetch(
        "http://52.23.26.163:7070/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contrasena }),
        }
      );

      const data = await response.json();

      if (data.success && data.usuario) {
        const usuario = data.usuario;

        sessionStorage.setItem("id_usuario", usuario.id_usuario);
        sessionStorage.setItem("correo", usuario.correo);
        sessionStorage.setItem("nombre", usuario.nombre);
        sessionStorage.setItem("tipo", usuario.tipo);

        if (usuario.tipo === "admin") {
          router.push("/admin");
        } else {
          router.push("/restaurantero");
        }
      } else {
        setErrorContrasena(
          data.message || "Credenciales incorrectas"
        );
      }
    } catch {
      setErrorContrasena(
        "Error de conexión con el servidor"
      );
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Image
          src="/images/logo_sp_rojo.png"
          alt="Logo"
          width={100}
          height={100}
          className={styles.logo}
        />

        <h4>Iniciar sesión</h4>

        <label className={styles.label}>
          Correo electrónico:
        </label>
        <input
          type="email"
          className={`${styles.controls} ${
            errorCorreo ? styles.inputError : ""
          }`}
          placeholder="Ingrese su correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <span className={styles.errorMsg}>
          {errorCorreo}
        </span>

        <label className={styles.label}>
          Contraseña:
        </label>
        <input
          type="password"
          className={`${styles.controls} ${
            errorContrasena ? styles.inputError : ""
          }`}
          placeholder="Ingrese su contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <span className={styles.errorMsg}>
          {errorContrasena}
        </span>

        <button className={styles.button} type="submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
