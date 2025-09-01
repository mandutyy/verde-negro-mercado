export const mockPlants = [
  {
    id: '1',
    title: 'Monstera Deliciosa - Planta adulta 2 años',
    price: 45,
    priceDisplay: '€45',
    location: 'Madrid Centro',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=400&fit=crop'
    ],
    category: 'interior',
    condition: 'excellent',
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'PlantLover23',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 127,
      joinDate: 'Miembro desde 2023',
      responseTime: 'Responde en menos de 2 horas'
    },
    rating: 4.8,
    type: 'sell' as const,
    description: 'Monstera deliciosa adulta de 2 años, muy sana y con muchas hojas fenestradas. Incluye maceta de cerámica blanca. La planta está perfecta para cualquier hogar y es muy fácil de cuidar. Ha estado en mi salón con luz indirecta y se ha desarrollado fantásticamente.',
    timeAgo: 'hace 2h',
    views: 127,
    distance: '0.5 km',
    isPromoted: true,
    tags: ['Entrega a domicilio', 'Negociable', 'Incluye maceta', 'Saludable']
  },
  {
    id: '2',
    title: 'Colección de suculentas variadas',
    price: 0,
    priceDisplay: 'Intercambio',
    location: 'Barcelona',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1509315390165-4ca3449717d8?w=600&h=400&fit=crop'
    ],
    category: 'suculentas',
    condition: 'good',
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'SucculentSwap',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 84,
      joinDate: 'Miembro desde 2022',
      responseTime: 'Responde en menos de 1 hora'
    },
    rating: 4.9,
    type: 'exchange' as const,
    description: 'Colección de suculentas variadas en diferentes tamaños y colores. Busco intercambiar por cactus de diferentes especies o plantas de exterior resistentes.',
    timeAgo: 'hace 3h',
    views: 89,
    distance: '1.2 km',
    isUrgent: true,
    tags: ['Intercambio directo', 'Sin envío', 'Variadas']
  },
  {
    id: '3',
    title: 'Ficus Lyrata en maceta decorativa',
    price: 35,
    priceDisplay: '€35',
    location: 'Valencia',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=400&fit=crop'
    ],
    category: 'interior',
    condition: 'excellent',
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'OrchidExpert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 95,
      joinDate: 'Miembro desde 2023',
      responseTime: 'Responde en menos de 3 horas'
    },
    rating: 4.7,
    type: 'sell' as const,
    description: 'Hermosa Ficus Lyrata con 8 hojas grandes y sanas. Muy fácil de cuidar, perfecta para principiantes. Incluye maceta decorativa de cerámica.',
    timeAgo: 'hace 5h',
    views: 213,
    distance: '3.8 km',
    isPromoted: false,
    tags: ['Incluye maceta', 'Saludable', 'Para principiantes']
  },
  {
    id: '4',
    title: 'Pothos dorado - Muy sano',
    price: 15,
    priceDisplay: '€15',
    location: 'Sevilla',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=400&fit=crop'
    ],
    category: 'interior',
    condition: 'excellent',
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'PropagationPro',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 4.6,
      reviewCount: 156,
      joinDate: 'Miembro desde 2022',
      responseTime: 'Responde en menos de 4 horas'
    },
    rating: 4.6,
    type: 'sell' as const,
    description: 'Lote de 5 esquejes de Pothos: dorado, mármol, neon y plateado. Ya enraizados y listos para plantar. Perfectos para decorar cualquier espacio.',
    timeAgo: 'hace 1 día',
    views: 156,
    distance: '0.8 km',
    isPromoted: false,
    tags: ['Lote', 'Enraizados', 'Varios colores']
  },
  {
    id: '5',
    title: 'Palmera Areca - Decorativa',
    price: 60,
    priceDisplay: '€60',
    location: 'Bilbao',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop'
    ],
    category: 'interior',
    condition: 'excellent',
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'PlantCollector',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face',
      rating: 4.4,
      reviewCount: 73,
      joinDate: 'Miembro desde 2021',
      responseTime: 'Responde en menos de 6 horas'
    },
    rating: 4.4,
    type: 'sell' as const,
    description: 'Palmera Areca grande y decorativa para salones amplios. Ideal para purificar el aire y crear un ambiente tropical en casa.',
    timeAgo: 'hace 2 días',
    views: 67,
    distance: '5.2 km',
    isUrgent: false,
    tags: ['Planta grande', 'Decorativa', 'Purifica aire']
  },
  {
    id: '6',
    title: 'Sansevieria - Perfecta para principiantes',
    price: 0,
    priceDisplay: 'Intercambio',
    location: 'Málaga',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=400&fit=crop'
    ],
    category: 'interior',
    condition: 'excellent',
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'EasyPlants',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 112,
      joinDate: 'Miembro desde 2023',
      responseTime: 'Responde en menos de 2 horas'
    },
    rating: 4.8,
    type: 'exchange' as const,
    description: 'Sansevieria resistente, perfecta para oficinas y espacios con poca luz. Ideal para principiantes que buscan plantas de bajo mantenimiento.',
    timeAgo: 'hace 3 días',
    views: 89,
    distance: '2.1 km',
    isUrgent: false,
    tags: ['Resistente', 'Poca luz', 'Bajo mantenimiento']
  }
];