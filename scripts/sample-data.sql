-- Insert sample tips for individual users
INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
('Use LED light bulbs', 'Replace incandescent bulbs with LED bulbs to reduce electricity consumption by up to 75%', 'energy', 'individual', 'medium', 'true'),
('Walk or bike for short trips', 'Choose active transportation for trips under 2 miles to reduce carbon emissions', 'transport', 'individual', 'high', 'true'),
('Lower your thermostat', 'Reduce heating/cooling by 2°C to save 10-15% on energy bills', 'energy', 'individual', 'medium', 'true'),
('Unplug electronics when not in use', 'Eliminate phantom power draw by unplugging devices', 'energy', 'individual', 'low', 'true'),
('Use reusable bags', 'Reduce plastic waste by using reusable shopping bags', 'waste', 'individual', 'low', 'true');

-- Insert sample tips for companies
INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
('Implement remote work policies', 'Allow employees to work from home to reduce commuting emissions', 'transport', 'company', 'high', 'true'),
('Conduct energy audits', 'Regular energy audits can identify 15-30% energy savings opportunities', 'energy', 'company', 'high', 'true'),
('Switch to renewable energy', 'Source electricity from solar, wind, or other renewable sources', 'energy', 'company', 'high', 'true'),
('Optimize supply chain', 'Choose local suppliers and sustainable logistics to reduce transport emissions', 'industrial', 'company', 'high', 'true'),
('Implement waste reduction programs', 'Set up recycling and waste minimization programs', 'waste', 'company', 'medium', 'true');

-- Insert universal tips
INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
('Choose sustainable products', 'Buy products with minimal packaging and sustainable materials', 'waste', 'all', 'medium', 'true'),
('Monitor your carbon footprint', 'Track your emissions regularly to identify improvement areas', 'energy', 'all', 'medium', 'true');