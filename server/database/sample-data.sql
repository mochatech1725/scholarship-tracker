-- Sample Data for Scholarship Tracker Database
-- Generated from mock data files

-- Insert test users
INSERT INTO users (auth_user_id, first_name, last_name, email_address, phone_number, created_at, updated_at) VALUES
('auth0|6844d51eecdb753254ed6d53', 'Teial', 'Dickens', 'teial.dickens@gmail.com', '1234567890', NOW(), NOW());

-- Insert user search preferences
INSERT INTO user_search_preferences (user_id, target_type, subject_areas, academic_level, created_at, updated_at) VALUES
(1, 'Both', '["STEM", "Computer Science"]', 'College Freshman', NOW(), NOW());

-- Insert test recommenders
INSERT INTO recommenders (user_id, first_name, last_name, email_address, phone_number, relationship, created_at, updated_at) VALUES
('auth0|6844d51eecdb753254ed6d53', 'John', 'Smith', 'john.smith@school.edu', '555-0123', 'Academic Advisor', NOW(), NOW()),
('auth0|6844d51eecdb753254ed6d53', 'Sarah', 'Johnson', 'sarah.johnson@company.com', '555-0124', 'Work Supervisor', NOW(), NOW()),
('auth0|6844d51eecdb753254ed6d53', 'Michael', 'Brown', 'michael.brown@school.edu', '555-0125', 'Research Advisor', NOW(), NOW());

-- Insert test applications
INSERT INTO applications (user_id, scholarship_name, target_type, organization, org_website, platform, application_link, theme, amount, requirements, renewable, current_action, status, submission_date, open_date, due_date, created_at, updated_at) VALUES
('auth0|6844d51eecdb753254ed6d53', 'Test Scholarship', 'Merit', 'Test Company', 'https://testcompany.com', 'Common App', 'https://testcompany.com/apply', 'Leadership', 5000.00, 'Test requirements', TRUE, 'Waiting for Recommendations', 'In Progress', '2024-04-15', '2024-01-01', '2024-05-01', NOW(), NOW());

-- Insert test essays
INSERT INTO essays (application_id, theme, units, essay_link, word_count, created_at, updated_at) VALUES
(1, 'Leadership Experience', 'words', 'https://docs.google.com/document/d/essay1', 500, NOW(), NOW()),
(1, 'Personal Statement', 'characters', 'https://docs.google.com/document/d/essay2', 1000, NOW(), NOW());

-- Insert test recommendations
INSERT INTO recommendations (application_id, recommender_id, content, submitted_at, status, created_at, updated_at) VALUES
(1, 1, 'John Smith recommendation content', NULL, 'pending', NOW(), NOW()),
(1, 2, 'Sarah Johnson recommendation content', '2024-03-15', 'submitted', NOW(), NOW()),
(1, 3, 'Michael Brown recommendation content', NULL, 'pending', NOW(), NOW());

-- Insert test scholarships
INSERT INTO scholarships (scholarship_id, title, description, organization, target_type, min_award, max_award, deadline, eligibility, apply_url, url, source, active, created_at, updated_at) VALUES
('1', 'STEM Excellence Scholarship', 'Awarded to outstanding students pursuing degrees in STEM fields.', 'Tech Foundation', 'Merit', 10000.00, 10000.00, '2024-05-01', 'STEM major, minimum 3.8 GPA', 'https://techfoundation.org/scholarships/stem-excellence', 'https://techfoundation.org/scholarships/stem-excellence', 'Tech Foundation', TRUE, NOW(), NOW()),
('2', 'Arts Achievement Award', 'Supporting talented students in the arts and humanities.', 'Creative Arts Society', 'Merit', 5000.00, 5000.00, '2024-04-15', 'Portfolio submission required', 'https://creativearts.org/achievement-award', 'https://creativearts.org/achievement-award', 'Creative Arts Society', TRUE, NOW(), NOW()),
('3', 'Future Leaders Scholarship', 'Supporting the next generation of leaders in business and technology.', 'Leadership Foundation', 'Merit', 15000.00, 15000.00, '2024-06-01', 'Leadership experience, minimum 3.5 GPA', 'https://leadershipfoundation.org/future-leaders', 'https://leadershipfoundation.org/future-leaders', 'Leadership Foundation', TRUE, NOW(), NOW()),
('4', 'Community Service Award', 'Recognizing students who have made significant contributions to their communities.', 'Service Foundation', 'Merit', 8000.00, 8000.00, '2024-07-15', 'Minimum 100 hours of community service', 'https://servicefoundation.org/community-award', 'https://servicefoundation.org/community-award', 'Service Foundation', TRUE, NOW(), NOW());
