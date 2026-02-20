-- ============================================================================
-- Boshlang'ich ma'lumotlar (Seed Data)
-- ============================================================================

-- Time Slots (vaqt slotlari)
INSERT INTO time_slots (id, label, start_time, end_time, track) VALUES
  ('k1', '1-para', '08:30', '10:00', 'kunduzgi'),
  ('k2', '2-para', '10:00', '11:30', 'kunduzgi'),
  ('k3', '3-para', '12:00', '13:30', 'kunduzgi'),
  ('s1', '4-para', '13:30', '15:00', 'sirtqi'),
  ('s2', '5-para', '15:00', '16:30', 'sirtqi'),
  ('s3', '6-para', '16:30', '18:00', 'sirtqi'),
  ('e1', '7-para', '18:00', '19:30', 'kechki'),
  ('e2', '8-para', '19:30', '21:00', 'kechki')
ON CONFLICT (id) DO NOTHING;

-- Namuna yo'nalishlar
INSERT INTO departments (name) VALUES
  ('Iqtisodiyot'),
  ('Axborot texnologiyalari'),
  ('Turizm'),
  ('Menejment')
ON CONFLICT (name) DO NOTHING;

-- Namuna akademik davr
INSERT INTO academic_periods (name, start_date, end_date, is_active) VALUES
  ('2025-2026 Kuz semestri', '2025-09-01', '2026-01-15', true)
ON CONFLICT DO NOTHING;
