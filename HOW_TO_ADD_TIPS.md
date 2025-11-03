# How to Add Tips to Your Database

Your Tips page is working correctly, but there are no tips in the database yet. Follow these steps to add the tips:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `database_tips_reset.sql` (this file has 40 comprehensive tips)
5. Click "Run" to execute the query
6. Refresh your CarbonSense app and go to the Tips page

## Option 2: Add More Tips

If you want even more tips (100 total), after running the first file:

1. In Supabase SQL Editor, create another new query
2. Copy and paste the contents of `add_more_tips.sql` (this adds 60 more tips)
3. Click "Run"
4. Refresh your app

## Files in Your Project

- `database_tips_reset.sql` - Clears existing tips and adds 40 new well-defined tips
- `add_more_tips.sql` - Adds 60 additional tips (80 total after running both)

## Tip Categories

After running the SQL, you'll have tips in these categories:
- **Energy** (35 tips with add_more_tips.sql, 10 with just database_tips_reset.sql)
- **Transport** (25 tips with add_more_tips.sql, 10 with just database_tips_reset.sql)
- **Food** (20 tips with add_more_tips.sql, 8 with just database_tips_reset.sql)
- **Waste** (17 tips with add_more_tips.sql, 7 with just database_tips_reset.sql)
- **Water** (13 tips with add_more_tips.sql, 5 with just database_tips_reset.sql)

All tips include:
- Detailed explanations
- CO₂ savings estimates (kg/year)
- Difficulty levels (easy/medium/hard)
- Impact levels (low/medium/high)
- Credible source links
- Target audience (individual/company/all)

## Why Tips Weren't Showing

The Tips page code is working perfectly - it's just displaying "No tips found" because your database `tips` table is empty. Once you run either SQL file, the tips will appear immediately.
