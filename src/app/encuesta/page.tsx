"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "./encuesta.module.css";

interface EncuestaForm {
  atraccion: string;
  origen: string;
}

interface Errors {
  atraccion: string;
  origen: string;
}

export default function Encuesta() {
  const searchParams = useSearchParams();
  const restauranteId = searchParams.get("id");

  const [formData, setFormData] = useState<EncuestaForm>({
    atraccion: "",
    origen: "",
  });

  const [errors, setErrors] = useState<Errors>({
    atraccion: "",
    origen: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // 🔹 Prefetch de descargas (opcional)
  useEffect(() => {
    const fetchDescargas = async () => {
      if (!restauranteId) return;

      try {
        const resp = await fetch(
          `http://52.23.26.163:7070/descargas/restaurantero/${restauranteId}?_=${Date.now()}`
        );

        if (resp.ok) {
          const data = await resp.json();
          console.log("Cantidad actual de descargas:", data);
        }
      } catch (error) {
        console.warn("No se pudo obtener la cantidad de descargas");
      }
    };

    fetchDescargas();
  }, [restauranteId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: Errors = { atraccion: "", origen: "" };

    if (!formData.atraccion) {
      newErrors.atraccion = "Selecciona una opción";
      valid = false;
    }

    if (!formData.origen) {
      newErrors.origen = "Selecciona una opción";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!restauranteId) {
      alert("No se pudo identificar el restaurante.");
      return;
    }

    setLoading(true);

    try {
      const encuestaBody = {
        cantidad_descargas: 1,
        origen: formData.origen,
        opinion: formData.atraccion,
        id_restaurantero: restauranteId,
      };

      const response = await fetch(
        "http://52.23.26.163:7070/descargas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(encuestaBody),
        }
      );

      if (response.ok) {
        alert("Encuesta enviada correctamente ✅");
        setFormData({ atraccion: "", origen: "" });
      } else {
        alert("Error al enviar la encuesta");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al enviar la encuesta.");
    } finally {
      setLoading(false);
    }
  };

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

        <h2 className={styles.title}>Encuesta</h2>

        <label className={styles.label}>
          ¿Qué te atrajo del restaurante?
        </label>
        <select
          name="atraccion"
          value={formData.atraccion}
          onChange={handleChange}
          className={`${styles.select} ${
            errors.atraccion ? styles.error : ""
          }`}
        >
          <option value="">Selecciona una opción</option>
          <option value="La comida">La comida</option>
          <option value="La ubicación">La ubicación</option>
          <option value="Recomendación">Recomendación</option>
          <option value="El horario">El horario</option>
          <option value="La vista">La vista</option>
        </select>
        <span className={styles.errorMessage}>
          {errors.atraccion}
        </span>

        <label className={styles.label}>
          ¿De dónde nos visitas?
        </label>
        <select
          name="origen"
          value={formData.origen}
          onChange={handleChange}
          className={`${styles.select} ${
            errors.origen ? styles.error : ""
          }`}
        >
          <option value="">Selecciona una opción</option>
          <option value="Nacional">Nacional</option>
          <option value="Extranjero">Extranjero</option>
        </select>
        <span className={styles.errorMessage}>
          {errors.origen}
        </span>

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
