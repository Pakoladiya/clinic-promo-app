-- Migration: 003_seed_content
-- Sample promotional content for all 6 disciplines shown in the FilterBar.
-- Run once in the Supabase SQL Editor after 001 and 002.

INSERT INTO content (title, body, discipline) VALUES

-- ── Physio ───────────────────────────────────────────────────────────────────
(
  'Move More, Hurt Less',
  'Chronic pain affects millions — but it doesn''t have to be permanent. Research shows that guided movement and physiotherapy can reduce long-term pain by up to 60%. Our team creates personalised programs that rebuild strength and restore function, so you can get back to doing what you love.',
  'Physio'
),
(
  '5 Signs You Need to See a Physio',
  'Persistent back pain after two weeks. Stiffness that doesn''t ease with movement. Numbness or tingling in your limbs. Pain that disturbs your sleep. Difficulty returning to sport after injury. If any of these sound familiar, a physiotherapy assessment could be the first step toward lasting relief.',
  'Physio'
),
(
  'Post-Surgery Rehab: What to Expect',
  'Recovery after surgery is a journey, not a destination. A structured rehabilitation program helps restore range of motion, rebuild muscle, and prevent compensatory injury. Our physiotherapists work alongside your surgical team to design a recovery plan tailored to your procedure and your goals.',
  'Physio'
),

-- ── Ophthalmology ─────────────────────────────────────────────────────────────
(
  'Protect Your Vision: Annual Eye Exams Matter',
  'Many serious eye conditions — including glaucoma and macular degeneration — have no symptoms in their early stages. A comprehensive annual eye exam is the single most effective way to detect these conditions before they cause irreversible vision loss. Don''t wait for blurry vision to book your check-up.',
  'Ophthalmology'
),
(
  'Screen Time and Your Eyes',
  'Adults spend an average of 11 hours per day looking at screens. This can cause digital eye strain: dryness, headaches, and blurred vision. The 20-20-20 rule helps — every 20 minutes, look at something 20 feet away for 20 seconds. Our team can also assess whether blue-light lenses or lubricating drops are right for you.',
  'Ophthalmology'
),
(
  'Cataract Surgery: Clearer Than You Think',
  'Modern cataract surgery takes under 30 minutes and has a success rate above 95%. Most patients notice dramatically improved vision within 24 hours. If you''re experiencing cloudy or dimmed vision, increased sensitivity to glare, or fading colours, it may be time to discuss your options with our ophthalmology team.',
  'Ophthalmology'
),

-- ── Cardiology ───────────────────────────────────────────────────────────────
(
  'Know Your Numbers: Blood Pressure Explained',
  'Blood pressure under 120/80 mmHg is ideal. Readings above 140/90 indicate hypertension — a leading risk factor for heart attack and stroke. The alarming fact: most people with high blood pressure feel completely fine. Regular monitoring is the only way to know your true risk.',
  'Cardiology'
),
(
  'Heart Health Starts in Your 30s',
  'Cardiovascular disease is largely preventable, and the habits you build in your 30s and 40s shape your heart health for decades. Exercise, a balanced diet, not smoking, and managing stress are the cornerstones. Our cardiologists provide risk assessments and early intervention plans tailored to your lifestyle.',
  'Cardiology'
),
(
  'Warning Signs of a Heart Attack You Shouldn''t Ignore',
  'Chest pain or pressure. Shortness of breath. Pain radiating to the arm, jaw, or back. Nausea, cold sweats, or sudden fatigue. Women often experience atypical symptoms. If you or someone near you experiences these signs, call emergency services immediately. Time is muscle.',
  'Cardiology'
),

-- ── Dermatology ──────────────────────────────────────────────────────────────
(
  'The ABCDEs of Skin Cancer',
  'A: Asymmetry — one half doesn''t match the other. B: Border — edges are irregular or ragged. C: Colour — multiple shades in one mole. D: Diameter — larger than 6mm. E: Evolving — any change in size, shape, or colour. If a spot ticks any of these boxes, book a skin check today.',
  'Dermatology'
),
(
  'Eczema: More Than Just Dry Skin',
  'Eczema affects 1 in 5 children and 1 in 10 adults. It''s a chronic inflammatory condition that can significantly impact quality of life. The good news: modern treatments — from topical therapies to biologics — can achieve near-complete clearance for many patients. You don''t have to just manage it.',
  'Dermatology'
),
(
  'SPF Every Day, Not Just at the Beach',
  'UV radiation causes 90% of skin ageing and is the primary driver of skin cancer. Daily SPF 30+ application — even on cloudy days and while indoors near windows — is the most evidence-based anti-ageing strategy available. Our dermatologists can recommend formulations suited to your skin type.',
  'Dermatology'
),

-- ── Dentistry ────────────────────────────────────────────────────────────────
(
  'The Link Between Oral Health and Heart Disease',
  'Gum disease (periodontitis) is associated with a 2–3x increased risk of heart disease. Bacteria from infected gums can enter the bloodstream and trigger inflammation in blood vessels. Regular dental check-ups and professional cleans are about more than your smile — they''re about your overall health.',
  'Dentistry'
),
(
  'Why You Shouldn''t Ignore a Toothache',
  'Tooth pain rarely resolves on its own. What starts as sensitivity can progress to infection, abscess, and in severe cases, spread to surrounding tissue. Early treatment is always less invasive and less costly than waiting. Don''t self-medicate with pain relief and hope it goes away.',
  'Dentistry'
),
(
  'Children''s Dental Health: Starting Right',
  'The first dental visit should happen when the first tooth appears — or by age one at the latest. Early visits establish healthy habits, allow us to monitor development, and mean children grow up comfortable in the dental chair. Prevention now avoids complex treatment later.',
  'Dentistry'
),

-- ── Nutrition ────────────────────────────────────────────────────────────────
(
  'Food as Medicine: The Evidence',
  'A Mediterranean-style diet reduces the risk of cardiovascular disease by 30%, type 2 diabetes by 25%, and certain cancers significantly. These aren''t supplements or superfoods — they''re whole grains, vegetables, legumes, fish, and olive oil. Our dietitians translate the evidence into practical, realistic meal plans.',
  'Nutrition'
),
(
  'Why You''re Still Hungry After Eating',
  'Hunger after a full meal often signals a lack of protein or fibre — not calories. Protein and fibre trigger satiety hormones that signal your brain you''re full. Highly processed foods digest too quickly, leaving you hungry again within the hour. Understanding your hunger is the first step to sustainable eating.',
  'Nutrition'
),
(
  'Gut Health: Your Second Brain',
  'The gut contains over 100 million nerve cells and produces 95% of the body''s serotonin. A diverse microbiome — fed by variety in plant foods, fermented foods, and limited ultra-processed food — is linked to better mood, immune function, and metabolic health. Our nutritionists can help you build a gut-healthy plate.',
  'Nutrition'
);
