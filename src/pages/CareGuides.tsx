import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Sun, Thermometer, Scissors, Bug, Leaf, Flower2, TreePine, Sprout, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tips: { icon: React.ElementType; title: string; content: string }[];
}

const GUIDES: Guide[] = [
  {
    id: 'cactus',
    title: 'Cactus de interior',
    description: 'Cuidados básicos para tus cactus en casa',
    icon: '🌵',
    category: 'suculentas',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Necesitan luz directa al menos 4-6 horas al día. Colócalos cerca de una ventana orientada al sur.' },
      { icon: Droplets, title: 'Riego', content: 'Riega solo cuando el sustrato esté completamente seco. En invierno, reduce a una vez al mes.' },
      { icon: Thermometer, title: 'Temperatura', content: 'Prefieren entre 15-30°C. Evita corrientes de aire frío.' },
      { icon: Bug, title: 'Plagas', content: 'Vigila cochinillas y pulgones. Usa alcohol isopropílico con un bastoncillo para eliminarlas.' },
    ],
  },
  {
    id: 'plantas-oficina',
    title: 'Plantas de oficina',
    description: 'Las mejores plantas para espacios con poca luz',
    icon: '🪴',
    category: 'interior',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Pothos, sansevieria y zamioculca toleran poca luz. Evita luz directa intensa.' },
      { icon: Droplets, title: 'Riego', content: 'Riega 1-2 veces por semana. Deja secar la capa superior entre riegos.' },
      { icon: Scissors, title: 'Poda', content: 'Retira hojas amarillas regularmente. Poda en primavera para fomentar el crecimiento.' },
      { icon: Thermometer, title: 'Ambiente', content: 'Mantén la humedad con un pulverizador. El aire acondicionado puede resecarlas.' },
    ],
  },
  {
    id: 'suculentas',
    title: 'Suculentas',
    description: 'Guía completa para suculentas felices',
    icon: '🌿',
    category: 'suculentas',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Luz brillante indirecta o directa suave. Gira la maceta cada semana para crecimiento uniforme.' },
      { icon: Droplets, title: 'Riego', content: 'Método "remoja y seca": riega abundantemente y espera a que se seque totalmente. Cada 10-14 días.' },
      { icon: Thermometer, title: 'Sustrato', content: 'Usa sustrato específico para suculentas con buen drenaje. Mezcla perlita con tierra.' },
      { icon: Scissors, title: 'Propagación', content: 'Corta una hoja sana, deja cicatrizar 2-3 días y colócala sobre sustrato húmedo.' },
    ],
  },
  {
    id: 'aromaticas',
    title: 'Plantas aromáticas',
    description: 'Cultiva tus propias hierbas en casa',
    icon: '🌱',
    category: 'exterior',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Necesitan mínimo 6 horas de sol directo. Albahaca, romero y tomillo aman el sol.' },
      { icon: Droplets, title: 'Riego', content: 'Mantén el sustrato ligeramente húmedo. La albahaca necesita más agua que el romero.' },
      { icon: Scissors, title: 'Cosecha', content: 'Corta las puntas regularmente para fomentar el crecimiento. Nunca cortes más del 30%.' },
      { icon: Bug, title: 'Plagas', content: 'Planta albahaca cerca de tomates para repeler moscas. El romero repele mosquitos.' },
    ],
  },
  {
    id: 'poco-riego',
    title: 'Plantas de poco riego',
    description: 'Perfectas para olvidadizos del riego',
    icon: '💧',
    category: 'interior',
    tips: [
      { icon: Leaf, title: 'Mejores opciones', content: 'Sansevieria, ZZ plant, aloe vera, crasas y cactus son las más resistentes a la sequía.' },
      { icon: Droplets, title: 'Riego', content: 'Una vez cada 2-3 semanas es suficiente. En invierno incluso menos. Mejor poco que demasiado.' },
      { icon: Thermometer, title: 'Sustrato', content: 'Usa macetas con agujeros de drenaje. El exceso de agua es su peor enemigo.' },
      { icon: Sun, title: 'Ubicación', content: 'La mayoría tolera poca luz pero crece mejor con luz indirecta brillante.' },
    ],
  },
  {
    id: 'exterior',
    title: 'Jardín exterior',
    description: 'Consejos para tu jardín o terraza',
    icon: '🌳',
    category: 'exterior',
    tips: [
      { icon: Sun, title: 'Planificación', content: 'Observa las horas de sol en cada zona. Agrupa plantas con necesidades similares.' },
      { icon: Droplets, title: 'Riego', content: 'Riega temprano por la mañana o al atardecer. Evita mojar las hojas para prevenir hongos.' },
      { icon: Scissors, title: 'Mantenimiento', content: 'Poda las plantas al final del invierno. Abona en primavera y otoño.' },
      { icon: Bug, title: 'Control natural', content: 'Atrae mariquitas y abejas con flores. Usa jabón potásico para pulgones.' },
    ],
  },
];

const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: Leaf },
  { value: 'interior', label: 'Interior', icon: Flower2 },
  { value: 'exterior', label: 'Exterior', icon: TreePine },
  { value: 'suculentas', label: 'Suculentas', icon: Sprout },
];

const CareGuides = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const filteredGuides = activeCategory === 'all'
    ? GUIDES
    : GUIDES.filter(g => g.category === activeCategory);

  if (selectedGuide) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-background font-spline overflow-x-hidden">
        <header className="sticky top-0 z-20 glass-strong px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedGuide(null)} className="text-foreground hover:bg-muted rounded-full p-1.5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-2xl">{selectedGuide.icon}</span>
          <h1 className="text-foreground text-base font-bold flex-1">{selectedGuide.title}</h1>
        </header>

        <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
          <p className="text-muted-foreground text-sm">{selectedGuide.description}</p>

          {selectedGuide.tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-card rounded-xl p-4 border border-border/40">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <h3 className="text-foreground text-sm font-bold">{tip.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{tip.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline overflow-x-hidden">
      <div className="sticky top-0 z-20 glass-strong">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted rounded-full p-1.5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Leaf size={16} className="text-primary" />
            </div>
            <h1 className="text-foreground text-base font-bold">Guías de cuidado</h1>
          </div>
        </div>

        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border/30'
                )}
              >
                <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-xs', isActive ? 'font-bold' : 'font-medium')}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-4 pt-3 pb-24 space-y-3">
        {filteredGuides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="w-full bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="text-3xl">{guide.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground text-sm font-bold">{guide.title}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{guide.description}</p>
              <div className="flex items-center gap-1 mt-1.5 text-primary text-[10px] font-semibold">
                <span>{guide.tips.length} consejos</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CareGuides;
