
import Header from '@/components/Header';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Messages = () => {
  const conversations = [
    {
      id: '1',
      name: 'María García',
      lastMessage: '¿Está disponible la Monstera?',
      time: '2 min',
      avatar: 'MG',
      unread: true,
      plantImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=60&h=60&fit=crop'
    },
    {
      id: '2',
      name: 'Carlos López',
      lastMessage: 'Perfecto, quedamos el sábado',
      time: '1h',
      avatar: 'CL',
      unread: false,
      plantImage: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=60&h=60&fit=crop'
    },
    {
      id: '3',
      name: 'Ana Ruiz',
      lastMessage: '¿Podrías enviarme más fotos?',
      time: '3h',
      avatar: 'AR',
      unread: true,
      plantImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=60&h=60&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Mensajes" />
      
      <div className="px-4 py-4">
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-plant-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-plant-100 text-plant-700">
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-plant-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {conversation.time}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      conversation.unread ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                  
                  <img
                    src={conversation.plantImage}
                    alt="Plant"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-plant-100 p-4 rounded-full mb-4">
              <MessageCircle size={48} className="text-plant-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin mensajes aún
            </h3>
            <p className="text-gray-600 max-w-sm">
              Cuando contactes con otros usuarios, tus conversaciones aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
