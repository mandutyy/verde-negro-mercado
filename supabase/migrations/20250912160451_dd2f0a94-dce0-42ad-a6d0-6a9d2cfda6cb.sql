-- Allow participants to update their conversations (needed for message flow and timestamps)
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);