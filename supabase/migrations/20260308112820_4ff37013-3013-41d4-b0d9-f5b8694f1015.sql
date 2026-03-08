
-- Conversations table for messaging between guests and hosts
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL,
  host_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, guest_id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blocked dates table for hosts to manually block dates
CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, date)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = guest_id OR auth.uid() = host_id);

CREATE POLICY "Guests can create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = guest_id OR auth.uid() = host_id);

-- Messages policies
CREATE POLICY "Conversation participants can view messages" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  ));

CREATE POLICY "Conversation participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
    )
  );

CREATE POLICY "Participants can update messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  ));

-- Blocked dates policies
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Hosts can manage blocked dates" ON public.blocked_dates
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = blocked_dates.listing_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Hosts can delete blocked dates" ON public.blocked_dates
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = blocked_dates.listing_id AND l.user_id = auth.uid()
  ));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
