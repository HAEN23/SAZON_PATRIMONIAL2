"use client";

import { useEffect } from "react";
import styles from "./login-rest.module.css";

export default function LoginRest() {

  useEffect(() => {
    const form = document.getElementById("loginForm") as HTMLFormElement | null;
    if (!form) return;

    const handleSubmit = async (event: Event) => {
      event.preventDefault();

      const correo = document.getElementById("correo") as HTMLInputElement;
      const contrasena = document.getElementById("contrasena") as HTMLInputElement;

      const errorCorreo = document.getElementById("error-correo") as HTMLElement;
      const errorContrasena = document.getElementById("error-contrasena") as HTMLElement;

      let formularioValido = true;

      errorCorreo.textContent = "";
      errorContrasena.textContent = "";

      correo.classList.remove(styles.inputError);
      contrasena.classList.remove(styles.inputError);

      if (correo.value.trim() === "") {
        errorCorreo.textContent = "*Este campo es obligatorio.";
        correo.classList.add(styles.inputError);
        formularioValido = false;
      } else if (!isValidEmail(correo.value)) {
        errorCorreo.textContent = "*Ingrese un correo electrónico válido.";
        correo.classList.add(styles.inputError);
        formularioValido = false;
      }

      if (contrasena.value.trim() === "") {
        errorContrasena.textContent = "*Este campo es obligatorio.";
        contrasena.classList.add(styles.inputError);
        formularioValido = false;
      } else if (contrasena.value.length < 6) {
        errorContrasena.textContent = "*La contraseña debe tener al menos 6 caracteres.";
        contrasena.classList.add(styles.inputError);
        formularioValido = false;
      }

      if (!formularioValido) return;

      try {
        const res = await fetch("http://52.23.26.163:7070/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: correo.value,
            contrasena: contrasena.value
          })
        });

        const data = await res.json();

        if (data.success && data.usuario) {
          const usuario = data.usuario;

          sessionStorage.setItem("id_usuario", usuario.id_usuario);
          sessionStorage.setItem("correo", usuario.correo);
          sessionStorage.setItem("nombre", usuario.nombre);
          sessionStorage.setItem("tipo", usuario.tipo);

          if (usuario.tipo === "admin") {
            window.location.href = "/vistaPrincipalAdmin";
          } else {
            window.location.href = "/vistaPrincipalRestaurantero";
          }
        } else {
          errorContrasena.textContent =
            data.message || "Credenciales incorrectas";
        }
      } catch {
        errorContrasena.textContent =
          "Error de conexión con el servidor";
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  return (
    <section className={styles.form}>
      <form id="loginForm">
        <img
          src="/images/logo_sp_rojo.png"
          className={styles.logo}
          width={100}
          alt="Logo"
        />

        <h4>Iniciar sesión</h4>

        <label htmlFor="correo" className={styles.label}>
          Correo electrónico:
        </label>
        <input
          className={styles.controls}
          type="email"
          id="correo"
          placeholder="Ingrese su correo"
        />
        <span id="error-correo" className={styles.errorMsg}></span>

        <label htmlFor="contrasena" className={styles.label}>
          Contraseña:
        </label>
        <input
          className={styles.controls}
          type="password"
          id="contrasena"
          placeholder="Ingrese su contraseña"
        />
        <span id="error-contrasena" className={styles.errorMsg}></span>

        <input
          className={styles.button}
          type="submit"
          value="Iniciar sesión"
        />
      </form>
    </section>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
