import { Calendar, CheckCircle, XCircle, Clock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface SystemMessageData {
  type: 'reservation_requested' | 'reservation_accepted' | 'reservation_rejected' | 'reservation_cancelled';
  plantTitle?: string;
  requesterName?: string;
  reservationId?: string;
}

export const isSystemMessage = (content: string): boolean => {
  return content.startsWith('__SYSTEM__');
};

export const parseSystemMessage = (content: string): SystemMessageData | null => {
  if (!isSystemMessage(content)) return null;
  try {
    const jsonStr = content.replace('__SYSTEM__', '');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
};

export const createSystemMessageContent = (data: SystemMessageData): string => {
  return `__SYSTEM__${JSON.stringify(data)}`;
};

interface SystemMessageCardProps {
  data: SystemMessageData;
  timestamp: string;
}

const SystemMessageCard = ({ data, timestamp }: SystemMessageCardProps) => {
  const navigate = useNavigate();

  const getCardContent = () => {
    switch (data.type) {
      case 'reservation_requested':
        return {
          icon: <Calendar className="h-6 w-6 text-[#122118]" />,
          title: '¡Solicitud de reserva enviada!',
          description: `Has solicitado reservar "${data.plantTitle || 'esta planta'}". El vendedor recibirá tu solicitud.`,
          buttonText: 'Ver reservas',
          buttonAction: () => navigate('/reservations'),
          bgColor: 'bg-[#38e07b]/20',
          borderColor: 'border-[#38e07b]/40',
          textColor: 'text-[#38e07b]',
        };
      case 'reservation_accepted':
        return {
          icon: <CheckCircle className="h-6 w-6 text-[#122118]" />,
          title: '¡Reserva aceptada! 🎉',
          description: `Tu reserva para "${data.plantTitle || 'esta planta'}" ha sido aceptada. Coordina la entrega con el vendedor.`,
          buttonText: 'Ver detalles',
          buttonAction: () => navigate('/reservations'),
          bgColor: 'bg-[#38e07b]/20',
          borderColor: 'border-[#38e07b]/40',
          textColor: 'text-[#38e07b]',
        };
      case 'reservation_rejected':
        return {
          icon: <XCircle className="h-6 w-6 text-red-400" />,
          title: 'Reserva rechazada',
          description: `La reserva para "${data.plantTitle || 'esta planta'}" ha sido rechazada.`,
          buttonText: 'Ver reservas',
          buttonAction: () => navigate('/reservations'),
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
        };
      case 'reservation_cancelled':
        return {
          icon: <XCircle className="h-6 w-6 text-yellow-400" />,
          title: 'Reserva cancelada',
          description: `La reserva para "${data.plantTitle || 'esta planta'}" ha sido cancelada.`,
          buttonText: 'Ver reservas',
          buttonAction: () => navigate('/reservations'),
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
        };
      default:
        return null;
    }
  };

  const card = getCardContent();
  if (!card) return null;

  return (
    <div className="flex justify-center my-4 px-4">
      <div className={`${card.bgColor} ${card.borderColor} border rounded-2xl p-4 max-w-[320px] w-full`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#264532] flex items-center justify-center">
            <Bot className="h-5 w-5 text-[#38e07b]" />
          </div>
          <div className="flex-1">
            <p className={`${card.textColor} font-semibold text-sm leading-snug mb-1`}>
              {card.title}
            </p>
            <p className={`${card.textColor}/80 text-xs leading-relaxed`}>
              {card.description}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Button
            onClick={card.buttonAction}
            size="sm"
            className="bg-[#38e07b] text-[#122118] hover:bg-[#38e07b]/90 rounded-full px-6 font-semibold text-xs"
          >
            {card.buttonText}
          </Button>
          <span className="text-[#96c5a9] text-xs">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemMessageCard;
