-- Drop all training-related tables
-- Run this in Supabase SQL Editor to completely remove the training module

-- First, drop tables with foreign key dependencies (child tables first)
DROP TABLE IF EXISTS content_submissions CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS training_progress CASCADE;
DROP TABLE IF EXISTS training_content CASCADE;
DROP TABLE IF EXISTS training_modules CASCADE;
DROP TABLE IF EXISTS training_sections CASCADE;
DROP TABLE IF EXISTS training_enrollments CASCADE;
DROP TABLE IF EXISTS training_batches CASCADE;
DROP TABLE IF EXISTS batch_templates CASCADE;

-- Verify tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'training%' OR table_name LIKE 'quiz%' 
OR table_name LIKE 'interview%' OR table_name = 'content_submissions'
OR table_name = 'batch_templates';
