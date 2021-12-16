# This document describes the develop branches current commands

Commands can be found in /dist/app/commands

## /admin/GuestPass.js

command: /guest-pass user
description: 'Grant a temporary guest pass to a user'
user description: 'Grant guest pass to:'

## /afk/AFK.ts

command: /afk
description: 'Toggle AFK status'

## /bounty/Bounty.ts

command: /bounty claim | complete | create | publish | list | delete | submit
description: 'List, create, claim, delete, and complete bounties'

command: /bounty claim bounty-id
description: 'Claim a bounty to work on'
bounty-id description: 'Bounty Hash ID'

command: /bounty complete bounty-id
description: 'Mark bounty as complete and reward the claimer'
bounty-id description: 'Bounty Hash ID'

command: /bounty create title | reward | copies
description: 'Create a new draft of a bounty'
title description: 'Title of the bounty'
reward description: 'Reward for bounty completion'
copies description: 'Number of identical bounties to publish (level 3+, max 100)'

command: /bounty publish bounty-id
description: 'Validate discord handle'
bounty-id description: 'Bounty Hash ID'

command: /bounty list list-type
description: 'View a fitered list of bounties'
list-type description: 'Filter bounties by'
list-type choices: 'created by me' | 'claimed by me' | 'drafted by me' | 'open' | 'in progress'

command: /bounty delete bounty-id
description: 'Delete an open or in draft bounty'
bounty-id description: 'Bounty Hash ID'

command: /bounty submit bounty-id | url | notes
description: 'Submit a bounty for review'
bounty-id description: 'Bounty Hash ID'
url description: 'Url of work'
notes description: 'Any additional notes'

## coordinape/Coordinape.ts

command: /coordinape form-request
description: 'Manage Coordinape rounds'
from-request description: 'Send link to Coordinape round'

## /first-quest/FirstQuests.ts

command: /first-quest start | config | poap-refill refill-type
description: First Quest commands
start description: '(Re)start First Quest'
config description: 'Configure First Quest message content'
poap-refill description: 'Update POAP claim links'
refill-type description: 'Add or replace POAPs'

## /fun/roll.ts

command: /roll
description: 'Roll a number between 0 and 100'

## /help/FeatureRequest.ts

command: /feature-request
description: 'Retrieve feature request form'

## /help/Help.ts

command: /help bounty
description: 'Learn to manage bounties, add guests and more'
bounty description: 'Learn about managing bounties'

## /notion/NotionFAQs.ts

command: /faqs question
description: 'Get frequently asked questions'
question description: 'Ask a specific question'

## /notion/NotionGuildPage.ts

command: /notion guild
description: 'View a Guild\'s notion page'
guild description: 'Select a guild'
choices: analytics | av | bizdev | design | developers | education | egal | marketing | operations | research | translators | treasury | writers

## /scoap-squad/ScoapSquad.ts

command: /scoap-squad assemble
desription: 'Create or delete a SCOAP Squad request'
assemble description: 'Create a SCOAP Squad request'

## /timecard/Timecard.ts

command: /timecard checkin | checkout description | hours
description: 'Checkin, checkout, and calculate total hours'
checkin description: 'Initiate a timecard'
checkout description: 'End and log a timecard'
checkout description description: 'Log what you worked on'
hours description: 'Calculate total hours worked'
