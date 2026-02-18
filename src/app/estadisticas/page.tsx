"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import styles from "./estadisticas.module.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface Descarga {
  cantidad_descargas: number;
  origen: string;
  opinion: string;
}

export default function Estadisticas() {
  const router = useRouter();

  const [descargas, setDescargas] = useState<number>(0);
  const [nacional, setNacional] = useState<number>(0);
  const [extranjero, setExtranjero] = useState<number>(0);
  const [opinionLabels, setOpinionLabels] = useState<string[]>([]);
  const [opinionData, setOpinionData] = useState<number[]>([]);

  useEffect(() => {
    const idRestaurantero =
      sessionStorage.getItem("id_restaurantero") ||
      localStorage.getItem("id_restaurantero");

    if (!idRestaurantero) {
      alert("Debe iniciar sesión nuevamente.");
      router.push("/login");
      return;
    }

    fetch(
      `http://52.23.26.163:7070/descargas/restaurantero/${idRestaurantero}`
    )
      .then((res) => res.json())
      .then((data) => {
        let maxDescargas = 0;
        let nac = 0;
        let ext = 0;
        const opinionCount: Record<string, number> = {};

        if (data?.data && Array.isArray(data.data)) {
          data.data.forEach((d: Descarga) => {
            maxDescargas = Math.max(
              maxDescargas,
              d.cantidad_descargas || 0
            );

            if (d.origen?.toLowerCase() === "nacional") nac++;
            if (d.origen?.toLowerCase() === "extranjero") ext++;

            if (d.opinion) {
              opinionCount[d.opinion] =
                (opinionCount[d.opinion] || 0) + 1;
            }
          });
        }

        const sorted = Object.entries(opinionCount).sort(
          (a, b) => b[1] - a[1]
        );

        setDescargas(maxDescargas);
        setNacional(nac);
        setExtranjero(ext);
        setOpinionLabels(sorted.map(([op]) => op));
        setOpinionData(sorted.map(([, count]) => count));
      })
      .catch(() => {
        alert("Error al cargar estadísticas.");
      });
  }, [router]);

  const pieData = {
    labels: ["Locales", "Extranjeros"],
    datasets: [
      {
        data: [nacional, extranjero],
        backgroundColor: ["#6b1e1e", "#e07878"],
      },
    ],
  };

  const barData = {
    labels: opinionLabels,
    datasets: [
      {
        label: "Veces mencionado",
        data: opinionData,
        backgroundColor: ["#6b1e1e", "#a97c7c", "#e07878"],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Image
              src="/images/logo_sp_blanco.png"
              alt="Logo"
              width={80}
              height={80}
            />
            <span>Restaurantes San Cristóbal</span>
          </div>

          <button
            className={styles.logout}
            onClick={() => {
              sessionStorage.clear();
              localStorage.clear();
              router.push("/login");
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1>Estadísticas de su restaurante</h1>

        <div className={styles.grid}>
          {/* DESCARGAS */}
          <div className={styles.card}>
            <h3>DESCARGAS DE MENÚ</h3>
            <p>Total acumulado</p>
            <strong className={styles.bigNumber}>
              {descargas}
            </strong>
          </div>

          {/* ORIGEN */}
          <div className={styles.card}>
            <h3>INTERÉS POR ORIGEN</h3>
            <Pie data={pieData} />
          </div>

          {/* OPINIONES */}
          <div className={styles.card}>
            <h3>ASPECTOS DESTACADOS</h3>
            {opinionLabels.length > 0 ? (
              <Bar
                data={barData}
                options={{
                  indexAxis: "y",
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { beginAtZero: true },
                  },
                }}
              />
            ) : (
              <p>Sin datos disponibles.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
