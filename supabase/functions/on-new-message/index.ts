import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { record } = await req.json();
    
    console.log('Processing new message:', record);

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', record.conversation_id)
      .single();

    if (convError) {
      console.error('Error fetching conversation:', convError);
      throw convError;
    }

    // Determine recipient (the one who didn't send the message)
    const recipientId = record.sender_id === conversation.participant_1 
      ? conversation.participant_2 
      : conversation.participant_1;

    console.log('Recipient ID:', recipientId);

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', record.sender_id)
      .single();

    const senderName = senderProfile?.name || 'Usuario';
    const messageContent = record.image_url ? '📸 Imagen' : record.content;

    // Send push notification
    const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        recipient_id: recipientId,
        title: `Nuevo mensaje de ${senderName}`,
        body: messageContent,
        data: {
          type: 'message',
          conversationId: record.conversation_id,
          url: `/chat/${record.conversation_id}`
        }
      }
    });

    if (pushError) {
      console.error('Error sending push notification:', pushError);
    } else {
      console.log('Push notification sent successfully');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in on-new-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});