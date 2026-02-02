-- Create table for Develop Your Whole Self videos
CREATE TABLE public.wellness_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  duration TEXT,
  category TEXT NOT NULL CHECK (category IN ('mind', 'body', 'spirit')),
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view published videos
CREATE POLICY "Anyone can view published wellness videos"
ON public.wellness_videos
FOR SELECT
USING (published = true);

-- Super admin can do all
CREATE POLICY "Super admin can manage wellness videos"
ON public.wellness_videos
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Trigger for updated_at
CREATE TRIGGER update_wellness_videos_updated_at
BEFORE UPDATE ON public.wellness_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial Mind videos
INSERT INTO public.wellness_videos (title, description, youtube_id, duration, category, display_order) VALUES
('MOTIVERSITY Best of 2024', 'Two hours of the best motivational speeches to build mental toughness and resilience', 'CoCEeZ6_0j0', '2:00:00', 'mind', 1),
('How To Build A Champions Mindset', 'Science-backed strategies to develop a championship mentality', 'NPEW_2EepJk', '15:30', 'mind', 2),
('You vs You - David Goggins', 'Powerful message about conquering yourself and unlocking your true potential', 'VaxZKF-B2ng', '12:45', 'mind', 3),
('Champions Mentality', 'Best motivational speech by Billy Alsbrooks on developing a winner mindset', '0QuawrdEPZA', '18:20', 'mind', 4),
('Winners Mentality', 'Featuring David Goggins, Michael Jordan, and Mike Tyson on what it takes to win', 'J1znAuK1Mbo', '22:15', 'mind', 5),
('2024 GO HARD MINDSET', 'Powerful compilation featuring Goggins, Mark Cuban, Coach Pain and more', 'r3mHM0uVwTo', '45:00', 'mind', 6),
('YOU MUST KEEP GOING', 'Motivational video to push through adversity and never give up', 'gSDOlAqEX0E', '10:30', 'mind', 7),
('The Confidence Code', 'How MLB players dominate pressure with World Series coach David Franco', 'Mhi5dfQDiMk', '25:20', 'mind', 8),
('Narrow Your Focus', 'Mental strength technique to block distractions and slow the game down', 'vn4T5jwKJXo', '8:15', 'mind', 9),
('Master the Mental Game', 'Interview with Ken Ravizza, pioneer of mental game training', 'DLIX63yTckI', '32:00', 'mind', 10);

-- Insert initial Body videos
INSERT INTO public.wellness_videos (title, description, youtube_id, duration, category, display_order) VALUES
('Full Body Training - Build Muscle & Burn Fat', '45 minute full body workout with strength supersets and HIIT', 'oNvovAJphz8', '45:00', 'body', 1),
('Strength & Conditioning Workout', '30 minute complete strength and conditioning session', 'nhx7rq_9fAQ', '30:00', 'body', 2),
('Full Body HIIT - No Jumping', '30 minute workout to build muscle and burn fat without high impact', 'Xxs5YlHxFwI', '30:00', 'body', 3),
('Strength and Boxing Workout', '35 minute lower body strength with upper body boxing drills', 'Fapbuxi76sw', '35:00', 'body', 4),
('Full Body HIIT Supersets', '30 minute HIIT with supersets for maximum results', 'o7yA2Jjp7OQ', '30:00', 'body', 5),
('Upper Body with Cardio', '30 minute sweat session focusing on upper body and cardio', 'ZRefZ6Nvk74', '30:00', 'body', 6),
('The PERFECT Total Body Workout', 'Complete full body routine with sets and reps included', 'R6gZoAzAhCg', '22:00', 'body', 7),
('Build Muscle and Lose Fat Routine', 'The #1 full body routine for body recomposition', 'B12MXF0bSFo', '18:30', 'body', 8),
('Athletic Speed Training', 'Drills to improve speed, agility, and explosiveness', 'qVGJFMj7zqo', '25:00', 'body', 9),
('Core Strength for Athletes', 'Essential core exercises for athletic performance', 'dQw4w9WgXcQ', '20:00', 'body', 10);

-- Insert initial Spirit videos
INSERT INTO public.wellness_videos (title, description, youtube_id, duration, category, display_order) VALUES
('Sports Meditation for Peak Performance', '30-minute pre-game meditation to strengthen your mind and self-belief', 'xJCYoMEjtxY', '30:00', 'spirit', 1),
('Mindful Compassion for Athletes', '7-minute mindfulness practice for athletic well-being', 'UJRqf6XhIqs', '7:00', 'spirit', 2),
('Performance Meditation', 'Get your mind in the zone, clear and focused for your best performance', 'PxmtMa3Pzrk', '15:00', 'spirit', 3),
('Guided Visualization for Athletes', 'Unlock your full potential with this 7-minute guided meditation', 'iOHEiho5C8w', '7:00', 'spirit', 4),
('Visualization to Enhance Performance', '10-minute visualization practice for game days and training', 'IO_DvnQb5Gs', '10:00', 'spirit', 5),
('Gatha Practice for Athletes', '4-minute mindfulness breathing practice by Dr. Tim Pineau', 'oXWrU_WKnUM', '4:00', 'spirit', 6),
('Character & Long-Term Success', 'Why character matters as much as physical ability for young athletes', 'VBiYbKlvxWE', '24:00', 'spirit', 7),
('Build Positive Team Culture', 'Top 5 ways to build trust and create a winning team environment', '6yeQYjcdpT4', '16:30', 'spirit', 8),
('IMG Academy Leadership Class', 'Learn what it takes to become a better leader and teammate', '_irjqAmLLso', '11:45', 'spirit', 9),
('Gratitude Meditation for Athletes', 'Cultivate gratitude and positivity to enhance your athletic journey', 'ZToicYcHIOU', '12:00', 'spirit', 10);