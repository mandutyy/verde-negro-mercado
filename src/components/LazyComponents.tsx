import { lazy } from 'react';

// Lazy load heavy components to improve initial page load
export const LazyLocationMap = lazy(() => import('./LocationMap'));
export const LazyPlantCard = lazy(() => import('./PlantCard'));

// Loading fallback component
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-plant-600"></div>
  </div>
);