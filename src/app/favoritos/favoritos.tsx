'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './favoritos.module.css';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  schedule: string;
  tags: string[];
  imageUrl?: string;
  likesCount: number;
  facebook?: string;
  instagram?: string;
}

interface Favorite {
  id: number;
  restaurantId: number;
  createdAt: string;
  restaurant: Restaurant;
}

export default function Favoritos() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/favorites', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/cliente-login');
          return;
        }
        throw new Error('Error al cargar favoritos');
      }

      const data = await response.json();
      setFavorites(data.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: number) => {
    if (!confirm('¿Quitar este restaurante de favoritos?')) {
      return;
    }

    try {
      setRemovingId(restaurantId);
      
      const response = await fetch(`/api/restaurants/${restaurantId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al quitar de favoritos');
      }

      // Remover de la lista local
      setFavorites(prev => prev.filter(fav => fav.restaurantId !== restaurantId));
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al quitar de favoritos');
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewRestaurant = (restaurantId: number) => {
    router.push(`/vistaRestaurante/${restaurantId}`);
  };

  if (isLoading) {
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
            <h1>Mis Favoritos</h1>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
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
            <h1>Mis Favoritos</h1>
            <p>Catálogo de Restaurantes en Chiapa de Corzo</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {error && (
          <div className={styles.errorAlert}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❤️</div>
            <h2>No tienes favoritos aún</h2>
            <p>
              Explora restaurantes y marca tus favoritos para verlos aquí.
              ¡También podrás descargar sus menús!
            </p>
            <Link href="/" className={styles.exploreButton}>
              Explorar restaurantes
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.statsBar}>
              <span className={styles.statsCount}>
                {favorites.length} {favorites.length === 1 ? 'restaurante favorito' : 'restaurantes favoritos'}
              </span>
            </div>

            <div className={styles.restaurantGrid}>
              {favorites.map((favorite) => (
                <div key={favorite.id} className={styles.restaurantCard}>
                  {/* Imagen */}
                  <div className={styles.imageContainer}>
                    {favorite.restaurant.imageUrl ? (
                      <Image
                        src={favorite.restaurant.imageUrl}
                        alt={favorite.restaurant.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>🍽️</span>
                      </div>
                    )}
                    <button
                      className={styles.favoriteButton}
                      onClick={() => handleRemoveFavorite(favorite.restaurantId)}
                      disabled={removingId === favorite.restaurantId}
                      title="Quitar de favoritos"
                    >
                      {removingId === favorite.restaurantId ? (
                        <div className={styles.miniSpinner}></div>
                      ) : (
                        '❤️'
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div className={styles.cardContent}>
                    <h3 className={styles.restaurantName}>
                      {favorite.restaurant.name}
                    </h3>

                    <div className={styles.infoRow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{favorite.restaurant.address}</span>
                    </div>

                    {favorite.restaurant.phone && (
                      <div className={styles.infoRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92V19.92C22 20.4728 21.5523 20.9219 21 20.92C10.0736 20.9219 1.07848 11.9268 1.08 1C1.07848 0.447715 1.52764 0 2.08 0H5.08C5.63228 0 6.08 0.447715 6.08 1C6.08 2.94649 6.45552 4.80988 7.13856 6.52043C7.24857 6.77875 7.17516 7.07494 6.95856 7.25043L4.99856 8.91043C6.58856 12.4104 9.58856 15.4104 13.0886 16.9804L14.7486 15.0404C14.924 14.8238 15.2202 14.7504 15.4786 14.8604C17.1891 15.5434 19.0525 15.9189 20.9986 15.9189C21.5509 15.9189 21.9986 16.3667 21.9986 16.9189V19.9189L22 16.92Z" fill="currentColor"/>
                        </svg>
                        <span>{favorite.restaurant.phone}</span>
                      </div>
                    )}

                    {favorite.restaurant.schedule && (
                      <div className={styles.infoRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{favorite.restaurant.schedule}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {favorite.restaurant.tags && favorite.restaurant.tags.length > 0 && (
                      <div className={styles.tags}>
                        {favorite.restaurant.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className={styles.stats}>
                      <span className={styles.likesCount}>
                        ❤️ {favorite.restaurant.likesCount} likes
                      </span>
                      <span className={styles.addedDate}>
                        Agregado {new Date(favorite.createdAt).toLocaleDateString('es-MX', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => handleViewRestaurant(favorite.restaurantId)}
                      >
                        Ver detalles
                      </button>
                      <Link
                        href={`/api/menus/restaurant/${favorite.restaurantId}/download`}
                        className={styles.downloadButton}
                        target="_blank"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Menú
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2024 Sazón Patrimonial - Chiapa de Corzo</p>
      </footer>
    </div>
  );
}