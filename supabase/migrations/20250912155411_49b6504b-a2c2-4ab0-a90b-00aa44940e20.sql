-- Allow participants to update their conversations (needed for message flow and timestamps)
CREATE POLICY IF NOT EXISTS "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Keep updated_at fresh automatically on any update
CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();