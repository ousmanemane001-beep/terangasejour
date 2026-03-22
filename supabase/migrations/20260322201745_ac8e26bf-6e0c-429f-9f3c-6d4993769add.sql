
-- Create disputes table for conflict management
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  host_id UUID NOT NULL,
  problem_type TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_disputes_booking FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reporters can view own disputes" ON public.disputes
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Hosts can view disputes for their bookings" ON public.disputes
  FOR SELECT TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Admins can view all disputes" ON public.disputes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create disputes" ON public.disputes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update disputes" ON public.disputes
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Dispute evidence table
CREATE TABLE public.dispute_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evidence viewable by dispute participants" ON public.dispute_evidence
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.disputes d
    WHERE d.id = dispute_evidence.dispute_id
    AND (d.reporter_id = auth.uid() OR d.host_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "Users can upload evidence" ON public.dispute_evidence
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage evidence" ON public.dispute_evidence
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
