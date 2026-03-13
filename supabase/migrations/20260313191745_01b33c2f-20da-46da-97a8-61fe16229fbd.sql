
-- Add tags column to community_posts
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

-- Add best_answer_id to community_posts (references a comment)
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS best_answer_id uuid REFERENCES public.post_comments(id) ON DELETE SET NULL;

-- Create comment votes table
CREATE TABLE public.comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  vote_type text NOT NULL DEFAULT 'up' CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change vote" ON public.comment_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove vote" ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);

-- Add vote_count to post_comments
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS vote_count integer DEFAULT 0;

-- Trigger to update vote count
CREATE OR REPLACE FUNCTION public.update_comment_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET vote_count = vote_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_vote_change
AFTER INSERT OR DELETE ON public.comment_votes
FOR EACH ROW EXECUTE FUNCTION public.update_comment_vote_count();
