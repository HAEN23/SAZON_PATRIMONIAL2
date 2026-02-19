"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

interface Restaurante {
  id?: number;
  id_restaurantero?: number;
  correo?: string;
  nombre_propuesto_restaurante?: string;
  restaurante?: string;
  estado?: string;
  etiqueta1?: string;
  etiqueta2?: string;
  etiqueta3?: string;
}

export default function Home() {
  const router = useRouter();

  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAmbiente, setFiltroAmbiente] = useState("");
  const [filtroServicios, setFiltroServicios] = useState("");

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  async function cargarRestaurantes() {
    try {
      const response = await fetch(
        "http://52.23.26.163:7070/solicitudes"
      );
      const data = await response.json();

      const solicitudes = data.data || data;

      const aprobados = solicitudes.filter(
        (r: Restaurante) =>
          r.estado?.toLowerCase() === "aprobado"
      );

      setRestaurantes(aprobados);
    } catch (error) {
      console.error("Error cargando restaurantes:", error);
    }
  }

  function restauranteTieneEtiqueta(
    restaurante: Restaurante,
    etiqueta: string
  ) {
    if (!etiqueta) return true;

    const etiquetas = [
      restaurante.etiqueta1,
      restaurante.etiqueta2,
      restaurante.etiqueta3,
    ].filter(Boolean);

    return etiquetas.some(
      (e) => e?.toLowerCase() === etiqueta.toLowerCase()
    );
  }

  const restaurantesFiltrados = restaurantes.filter((r) => {
    const nombre =
      r.nombre_propuesto_restaurante || r.restaurante || "";

    const coincideBusqueda =
      !busqueda ||
      nombre.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = restauranteTieneEtiqueta(
      r,
      filtroTipo
    );
    const coincideAmbiente = restauranteTieneEtiqueta(
      r,
      filtroAmbiente
    );
    const coincideServicios = restauranteTieneEtiqueta(
      r,
      filtroServicios
    );

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideAmbiente &&
      coincideServicios
    );
  });

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Image
              src="/images/logo_sp_blanco.png"
              alt="Logo"
              width={80}
              height={80}
            />
            <span>Restaurantes Chiapa de Corzo</span>
          </div>

          <div className={styles.actions}>
            <button onClick={() => router.push("/registro")}>
              Registrarse
            </button>
            <button onClick={() => router.push("/select-login")}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <Image
          src="/images/fondo_inicio.png"
          alt="Fondo"
          fill
          priority
          className={styles.heroImage}
        />

        <div className={styles.heroContent}>
          <h1>
            Descubre la Magia Culinaria de
            <br />
            Chiapa de Corzo
          </h1>
          <p>Explora los mejores sabores de esta tierra</p>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar restaurantes"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />
          </div>

          {/* FILTROS */}
          <div className={styles.filters}>
            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(e.target.value)
              }
            >
              <option value="">Tipo de comida</option>
              <option value="Comida Rápida">
                Comida Rápida
              </option>
              <option value="Gourmet">Gourmet</option>
              <option value="Vegetariano">
                Vegetariano
              </option>
              <option value="Económico">
                Económico
              </option>
            </select>

            <select
              value={filtroAmbiente}
              onChange={(e) =>
                setFiltroAmbiente(e.target.value)
              }
            >
              <option value="">Ambiente</option>
              <option value="Familiar">Familiar</option>
              <option value="Pet Friendly">
                Pet Friendly
              </option>
              <option value="Terraza">Terraza</option>
            </select>

            <select
              value={filtroServicios}
              onChange={(e) =>
                setFiltroServicios(e.target.value)
              }
            >
              <option value="">Servicios</option>
              <option value="Delivery">Delivery</option>
              <option value="WiFi Gratuito">
                WiFi Gratuito
              </option>
              <option value="Estacionamiento">
                Estacionamiento
              </option>
            </select>

            <button
              onClick={() => {
                setBusqueda("");
                setFiltroTipo("");
                setFiltroAmbiente("");
                setFiltroServicios("");
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      {/* RESTAURANTES */}
      <section className={styles.cards}>
        {restaurantesFiltrados.length === 0 ? (
          <p>No se encontraron restaurantes.</p>
        ) : (
          restaurantesFiltrados.map((r, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() =>
                router.push(
                  `/vistaRestaurante?id=${
                    r.id || ""
                  }`
                )
              }
            >
              <Image
                src="/images/img_rest2.jpg"
                alt="Restaurante"
                width={300}
                height={200}
              />
              <h3>
                {r.nombre_propuesto_restaurante ||
                  r.restaurante}
              </h3>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
