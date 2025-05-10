-- Insert example task templates
INSERT INTO public.task_templates (
  title,
  description,
  link,
  reward,
  is_active
) VALUES 
(
  'Sign Up on HustleHub',
  'Register on HustleHub using the link and complete your profile. Earn KSh 10 after verification.',
  'https://hustlehub.co.ke/signup?ref=youraffiliateid',
  10,
  true
),
(
  'Install M-PESA App',
  'Download and install the M-PESA app from the Play Store. Complete the registration process to earn KSh 15.',
  'https://play.google.com/store/apps/details?id=com.safaricom.mpesa',
  15,
  true
),
(
  'Watch Tutorial Video',
  'Watch our 5-minute tutorial on how to maximize your earnings on Shujaa. Earn KSh 5 for completing the video.',
  'https://youtube.com/watch?v=shujaa-tutorial',
  5,
  true
),
(
  'Complete Profile Survey',
  'Help us improve by completing a quick 2-minute survey about your experience. Earn KSh 8 for your feedback.',
  'https://forms.google.com/shujaa-survey',
  8,
  true
),
(
  'Refer a Friend',
  'Invite a friend to join Shujaa using your referral link. Earn KSh 20 when they complete their first task.',
  'https://shujaa.co.ke/invite?ref=yourcode',
  20,
  true
); 