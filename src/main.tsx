import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Configurar React Query con caché más agresivo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos en caché
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1
    }
  }
});

console.log('Main.tsx loading...');

try {
  const rootElement = document.getElementById("root");
  console.log('Root element:', rootElement);
  
  if (rootElement) {
    console.log('Creating React root...');
    const root = createRoot(rootElement);
    console.log('Rendering App...');
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    console.log('App rendered successfully');
  } else {
    console.error('Root element not found!');
  }
} catch (error) {
  console.error('Error in main.tsx:', error);
}
