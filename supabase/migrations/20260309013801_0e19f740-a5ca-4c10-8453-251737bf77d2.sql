
-- Insert new video category for Mic'd Up content
INSERT INTO public.video_categories (name, description, icon_name, color_gradient, display_order, published)
VALUES (
  'Mic''d Up: Positive Energy',
  'Professional athletes mic''d up showing positive self-talk, energy, and encouragement',
  'Mic',
  'from-yellow-500/20 to-amber-600/20 border-yellow-500/40',
  7,
  true
);

-- Insert videos into the new category
WITH new_cat AS (
  SELECT id FROM public.video_categories WHERE name = 'Mic''d Up: Positive Energy' LIMIT 1
)
INSERT INTO public.videos (title, description, youtube_id, duration, category_id, display_order, published)
SELECT title, description, youtube_id, duration, new_cat.id, display_order, true
FROM new_cat, (VALUES
  ('Sports Players Use Self Talk', 'Compilation showing how professional athletes use positive self-talk during competition', '-BKWlMBleYQ', '3:45', 1),
  ('Adrian Peterson & More Stars Mic''d Up Self Talk', 'NFL Films presents athletes using positive self-talk and encouragement on the field', 'BRJLfTIPpBE', '8:30', 2),
  ('Best Of Mookie Betts Mic''d Up', 'Mookie Betts brings infectious positive energy while mic''d up during games', 'mED8m3KbZUE', '10:15', 3),
  ('Mookie Betts'' Hilarious Positive Reaction Mic''d Up', 'Dodgers star Mookie Betts showing love for the game and teammates while wired', '-RG0RGKBAkw', '4:20', 4),
  ('Mookie Betts Reacts to Ohtani''s Monster Game', 'Betts mic''d up hyping his teammate Shohei Ohtani with pure joy and respect', 'xo-GZlA1BDg', '6:30', 5),
  ('Francisco Lindor DAZZLING on the Mic', 'Mets shortstop Lindor brings energy and confidence while playing and talking', 'q4UMOZz-XHE', '12:00', 6),
  ('MLB Players Having the BEST TIME at World Series Mic''d Up', 'Top MLB stars showing pure joy and positive energy during the World Series', '9Sq8Ky56MEA', '14:20', 7),
  ('MLB Superstars Best Mic''d Up Moments', 'Compilation of MLB superstars bringing positive vibes and self-belief while wired for sound', 'tHCUsmldRNE', '18:45', 8),
  ('Best of Mic''d Up at 2025 MLB All-Star Game', 'All-Star players showing camaraderie, confidence, and positive energy', '8mka9oDQSl8', '15:00', 9),
  ('Best of Mic''d Up at 2024 MLB All-Star Game', 'Judge, Soto, Big Papi and more bringing the positive energy at the All-Star Game', 'WFFnSxPaBZU', '16:30', 10),
  ('2025 MLB All-Star Game Best Mic''d Up Moments', 'FOX Sports compilation of the best positive moments from All-Star festivities', '82nwXnPAn-M', '12:00', 11),
  ('Stephen Curry Mic''d Up at 2021 NBA All-Star Game', 'Steph Curry''s infectious confidence and humor while wired at the All-Star Game', '8XIb15c5AU0', '8:30', 12),
  ('Stephen Curry Mic''d Up on Christmas Day', 'Curry bringing positive energy and self-belief during a marquee Christmas Day game', 'PoTiG-JbBkQ', '7:45', 13),
  ('Stephen Curry Logo 3-Pointer "I Told You"', 'Curry calls his shot from the logo and backs it up with supreme confidence', 'XIb15c5AU0', '2:30', 14),
  ('LeBron James Mic''d Up - USABMNT Practice', 'The King leads with positivity and encouragement during Team USA practice', '5Uqs3vdBBkI', '1:25', 15),
  ('LeBron James Mic''d Up vs Knicks', 'LeBron showing leadership, self-talk, and positive energy against New York', 'ppMC0aRFWiM', '8:00', 16),
  ('Patrick Mahomes Mic''d Up in AFC Championship Win', 'Mahomes'' positive leadership and clutch self-talk while leading the Chiefs to victory', 'FpxxqzTTAmc', '12:30', 17),
  ('Fred Warner Brings the Energy at Pro Bowl', 'Warner''s non-stop positive energy and encouragement while mic''d up at the Pro Bowl', 'AAGIjmKCia0', '8:15', 18),
  ('George Kittle ''One Play at a Time'' Mic''d Up vs Packers', 'Kittle showing elite positive self-talk and focus while competing', 'D_k1NmD8Yyc', '9:00', 19),
  ('Fred Warner Dialed In Mic''d Up vs Packers', 'Warner demonstrating intense focus and positive team energy on defense', 'u96ckP1TQBk', '7:30', 20),
  ('The BEST of Pro Bowl 2025 Mic''d Up Compilation', 'Top NFL stars bringing joy, positivity, and encouragement at the Pro Bowl', 'LxVYq4bC-hw', '15:00', 21),
  ('Best Mic''d Up Moments of the 2023 NFL Season', 'Season-long compilation of the most positive and inspiring mic''d up moments', 'tmcV6DxvQIQ', '20:00', 22),
  ('Best QB Mic''d Up Moments 2024-25 NFL Season', 'Top quarterbacks showing confidence, leadership, and positive self-talk all season', 'CReYDQ62Jss', '18:00', 23),
  ('Mike Evans Mic''d Up at Pro Bowl Practice', 'Evans bringing positive energy and encouragement while wired at Pro Bowl practice', '_GJ8hTvRaeY', '6:00', 24),
  ('Best Mic''d Up Moments 2025 MLB Season So Far', 'Fresh compilation of positive energy and self-talk from the current MLB season', 'oXXvj5WJBzc', '14:00', 25)
) AS v(title, description, youtube_id, duration, display_order);
