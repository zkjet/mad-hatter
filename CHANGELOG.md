# Changelog

## 1.4.1-RELEASE (2022-04-01)

1. Update Coordinape form for March

## 1.4.0-RELEASE

1. Add Sentry breadcrumbs
2. Add Makefile and Dockerfile for arm machines
3. Add notion meeting command
4. Add SquadUp feature (/squad up command) - tool to assemble project teams
5. remove ScoapSquad feature (/scoap-squad command)
6. Update coordinape links for March round

## 1.3.2

1. Send Tips of $BANK on Polygon with `/tip` command.

## 1.3.1-RELEASE (2022-02-03)

1. Feb coordinape distribution round link update

## 1.3.0-RELEASE (2022-01-13)

1. Remove datadog tracer
2. Add more phrases and fix grammar and add typing feature
3. Add OpenTelemetry and Honeycomb exporter
4. Post first-quest rescue call to support thread instead of channel
5. Remove dependency on roles from First Quest feature
   - Roles are replaced by database record for DM flow.
   - First Quest Welcome Role ist still needed by captcha library but directly removed after captcha success
   - Also fixes the message scramble bug that was discovered earlier
6. First Quest feature: Replace timeout with cron job
7. Add character limit check for first-quest config
8. Add Commands.md to document commands and descriptions on develop branch
9. Update command descriptions for conciseness and consistency
10. Add more names to username spam filter
11. Remove first quest features
12. Update notion client to v0.4.1

## 1.2.4-RELEASE (2022-01-05)

1. Add Sentry.io tracking and add stability enhancements
   - fix dsn

## 1.2.3-RELEASE (2021-12-30)

1. Update Coordinape round url for January 2022

## 1.2.2-RELEASE (2021-12-20)

1. Remove bounty commands
2. Fix yarn lint

## 1.2.1-RELEASE (2021-12-10)

1. Hotfix to enforce 2000 character constraint in first quest messages
2. Update default first quest messages 1-7 to current version (for db init)

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
