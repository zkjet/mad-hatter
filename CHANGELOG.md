# Changelog

## 1.3.0-RELEASE

1. Remove datadog tracer
2. Add more phrases and fix grammar and add typing feature
3. Add OpenTelemetry and Honeycomb exporter
4. Post first-quest rescue call to support thread instead of channel
5. Remove dependency on roles from First Quest feature
   - Roles are replaced by database record for DM flow.
   - First Quest Welcome Role ist still needed by captcha library but directly removed after captcha success
   - Also fixes the message scramble bug that was discovered earlier
6. First Quest feature: Replace timout with cron job
7. Add character limit check for first-quest config
8. Add Commands.md to document commands and descriptions on develop branch
9. Update command descriptions for conciseness and consistency
10. Add more names to username spam filter


## 1.2.0-RELEASE (2021-11-30)

1. Add message stability
2. Add new coordinape round for guest/L1/L2

## 1.1.1-RELEASE (2021-11-27)

1. Improve /first-quest start command
   - simplify command logic
   - switch to event based launch of first quest
   - fix bug of first quest getting triggered twice
   - route rescue call to first quest channel instead of general support

## 1.1.0-RELEASE (2021-11-26)

1. Handle edge cases for first quest
   - flow captcha in text channel only
   - add first quest start command
   - enhance stability

## 1.0.1-RELEASE (2021-11-24)

1. Add more phrases and add some logging to first quest
2. Generate new captcha on failure
3. Regenerate captcha upon failure
4. Fix first quest flow for assigning role

## 1.0.0-RELEASE (2021-11-23)

1. Repo initialized
2. Migrate repository from https://github.com/BanklessDAO/discord-bot-degen/commit/787c5fdd6b5e73e5e48bbf5c4460f06c41331e40
3. Setup heroku integration
4. Misc fixes and stability enhancements
5. Add messaging in channels
6. Add catch handlers for message creation events
7. Add AFK key to prod
