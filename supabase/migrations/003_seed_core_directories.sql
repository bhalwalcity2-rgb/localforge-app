insert into public.directories
  (name, website_url, submission_url, type, country, is_paid, login_required, verification_type, priority_score, notes)
select *
from (
  values
    ('Google Business Profile', 'https://www.google.com/business/', 'https://business.google.com/', 'core', 'US', false, true, 'manual', 100, 'Primary local profile. OAuth sync planned.'),
    ('Bing Places', 'https://www.bingplaces.com/', 'https://www.bingplaces.com/', 'core', 'US', false, true, 'manual', 92, 'Core map listing.'),
    ('Apple Business Connect', 'https://businessconnect.apple.com/', 'https://businessconnect.apple.com/', 'core', 'US', false, true, 'manual', 90, 'Apple Maps listing.'),
    ('Facebook Pages', 'https://www.facebook.com/pages/create/', 'https://www.facebook.com/pages/create/', 'core', 'US', false, true, 'manual', 84, 'Social profile and local citation.'),
    ('Yelp', 'https://www.yelp.com/', 'https://biz.yelp.com/', 'core', 'US', false, true, 'phone', 82, 'High visibility citation source.'),
    ('Better Business Bureau', 'https://www.bbb.org/', 'https://www.bbb.org/get-listed', 'trust', 'US', true, true, 'manual', 70, 'Trust citation, may require paid account.'),
    ('Hotfrog', 'https://www.hotfrog.com/', 'https://www.hotfrog.com/AddYourBusiness', 'general', 'US', false, false, 'email', 58, 'General business directory.'),
    ('Brownbook', 'https://www.brownbook.net/', 'https://www.brownbook.net/business/add', 'general', 'US', false, false, 'email', 55, 'General citation source.')
) as seed(name, website_url, submission_url, directory_type, country, is_paid, login_required, verification_type, priority_score, notes)
where not exists (
  select 1
  from public.directories d
  where lower(d.name) = lower(seed.name)
);
