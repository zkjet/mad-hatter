const firstQuest = Object.freeze({

	FIRST_QUEST_STEPS : {
		verified: 'FIRST_QUEST_STEP_1',
		first_quest_welcome: 'FIRST_QUEST_STEP_2',
		first_quest_membership: 'FIRST_QUEST_STEP_3',
		firehose: 'FIRST_QUEST_STEP_4',
		first_quest_scholar: 'FIRST_QUEST_STEP_5',
		first_quest_guest_pass: 'FIRST_QUEST_STEP_6',
		first_quest: 'FIRST_QUEST_STEP_7',
		first_quest_complete: 'FIRST_QUEST_STEP_8',
	},

	FIRST_QUEST_DB_DOCUMENT_ID: '61743936a3f05763f8d90719',

	FIRST_QUEST_INIT : {
		'fq1': 'Important message #1: **We will not send you a Direct Message (DM) offering DAO assistance or airdrops.** We recommend seeking help by chatting in the <#834499078434979893> channel.\n' +
			'\n' +
			'Important message #2: **Never ever reveal the private keys of your wallet. Do not click on unsolicited links that you receive in your DMs.** If you are unsure, ask in the BanklessDAO discord and wait for someone to verify if a DM is authentic or not.\n' +
			'\n' +
			'Important message #3: If you get stuck during onboarding for 10 hours, a bot will automatically message <#916371841587761186> and we will help you out. \n' +
			'\n' +
			'Please react with :bank: emoji if you have read this message and are ready to begin your first quest.',
		'fq2': '**Welcome to your first quests!**\n' +
			'\n' +
			'First quests were created to ensure a comprehensive onboarding experience. You will be introduced to the ideas behind BanklessDAO, the tools we use, and how to get involved.\n' +
			'\n' +
			'**What is Bankless?**\n' +
			'\n' +
			'Bankless is a movement for people seeking liberation from the tyranny of the traditional financial system. Going Bankless means adopting decentralized, permissionless, and censorship-resistant technology. Through these means, we aim to achieve financial self-sovereignty, security, and prosperity.\n' +
			'\n' +
			'React with the :bank: emoji to advance!',
		'fq3': 'BanklessDAO is the decentralized autonomous organization that acts as a steward of the Bankless Movement, progressing the world towards a future of greater freedom.\n' +
			'\n' +
			'🔸 Mission: We will help the world go Bankless by creating user-friendly onramps for people to discover decentralized financial technologies through education, media, and culture.\n' +
			'\n' +
			'🔸 Vision: To live in a world where anyone with an internet connection has access to the financial tools needed to achieve financial independence.\n' +
			'\n' +
			'🔸 Values:\n' +
			'\n' +
			'1. **Education**: We learn from each other. We seek to become a trusted guide that empowers people all over the globe to adopt decentralized finance by sharing accurate, truthful, and objective information.\n' +
			'2. **Integrity**: We operate transparently and build trust through radically public discourse and financial auditability.\n' +
			'3. **Decentralized Governance**: We put decision making into the hands of the collective. We create legitimacy through an environment where the best ideas win.\n' +
			'4. **Culture**: We reward action and embrace risk. We empower our community to continually drive new initiatives by providing a space to self-organize and quickly move from idea to action.\n' +
			'\n' +
			'You might see fellow DAO members bearing a black flag flag_black next to their name. In David Hoffman\'s words: *A flag with no marks and no colors reflects the removal of subjectivity from the Bankless nation. The colors, stripes, and shapes on a nation state flag reflect their subjective ‘this is good’ attitudes, and a black flag is the rejection of this attitude of governance.*\n' +
			'\n' +
			'You can also watch this video, if you prefer to listen to the BanklessDAO mission: https://link.assetfile.io/GLMEEdDQdVPCftF3cDiz5.mp4\n' +
			'\n' +
			'Please react with the :bank: emoji below to take the next step!',
		'fq4': 'Let\'s have a look at your membership status.\n' +
			'\n' +
			'Participation in the BanklessDAO has **no financial requirements**. If you want to participate, you can.\n' +
			'\n' +
			'But we do have membership tiers:\n' +
			'\n' +
			'- :person_curly_hair: Guest Pass: Under 35,000 $BANK, require regular renewal by any L2 contributor\n' +
			'- 🧑‍ L1 Member (Level 1): 35,000 $BANK OR 4,200 Balancer pool tokens ($BPT)\n' +
			'- :handshake: Contributor (Level 2): 35,000 $BANK + community nomination process + L1 membership\n' +
			'- :whale2: Whale (Level 3): 150,000 $BANK\n' +
			'- :whale2: Liquidity Provider (Level 4): 250 Uniswap V2 BANK/ETH LP tokens OR 25 Sushi/ETH LP tokens OR 15,000 $BPT\n' +
			'\n' +
			'Being a member unlocks participation in membership perks, such as raffles, early access to media, community events like Poker, D&D, RocketLeague tournaments, NFT alpha club, NFT whitelists and more.\n' +
			'\n' +
			'You do not need to be a Level 1 member to participate in the Discord. While we do gate access to posting in many Discord channels, there\'s a friendly Guest Pass system that we\'ll introduce in the next quest.\n' +
			'\n' +
			'You know what to do... click on the :pencil2: emoji!',
		'fq5': '**We do not want the 35,000 $BANK entry cost to prohibit people from contributing to our mission.** ***The guest pass allows the same privileges*** as L1s (except for access to membership perks).\n' +
			'\n' +
			'Once you receive a guest pass, it will remain active for 14 days. After the 14 days are up, you will have to reach out to a Level 2 member you\'ve met (their Discord names show as Orange) and ask them to reinstate your guest pass.\n' +
			'\n' +
			'In that time, we encourage you to contribute in small capacities. We believe that the best way to contribute is to introduce yourself, select one or two guilds or projects that suit you, and hop onto their weekly meetings regularly.\n' +
			'\n' +
			'There are unlimited ways to contribute/participate, you don’t have to be a Shadowy Super Coder to join! Wanna join? Well, there is one thing we\'d like for you to do before we get to it.\n' +
			'\n' +
			'Please react with the :pencil2: to learn how to stay updated at the DAO',
		'fq6': 'Fair warning, young warrior, our discord is our primary communication channel and can be very overwhelming. By design, you can only view a small subset of all discord channels so that you do not get overwhelmed. \n' +
			'\n' +
			'Discord operates using text and audio channels, nested within “categories” that have different access permissions. Let’s look at some of the important categories within the BanklessDAO Discord:\n' +
			'\n' +
			'- 🏦 Welcome (open to L0s and above): Channels in this category are open to anyone that joins the Discord.\n' +
			'- 🏦 BanklessDAO in Bites (open to L1s, Guest Passes, and above): Quickly plug yourself into meetings, polls, forums, and more\n' +
			'- 🏦 General (open to L1s, Guest Passes, and above): The main hangout for general DAO conversations.\n' +
			'- 🏦 Community Call (open to L1s, Guest Passes, and above): The CC is a vital source of information to catch up on all things DAO and celebrate our successes. Join us every Friday at 15:00 UTC.\n' +
			'- 🏦 Guilds and projects: The majority of the Discord is split among the various guilds and projects - This is where all the real work gets done! Guilds are talent pools, like Design, Writers, Developers, Legal, AudioVisual, and more. Projects are initiatives that draw on guilds (talent pools) to staff projects.\n' +
			'\n' +
			'BanklessDAO members are characterised by the guilds they join and the projects they are a part of. People from multiple guilds can work on a single project and people working on multiple projects can belong to a single guild! Becoming a part of a guild is the best way to stay up to date and becoming a part of the project is the best way to contribute.\n' +
			'\n' +
			'If you prefer to watch a video walkthrough, check out this video https://link.assetfile.io/2omevulyMERkFzsWmRPCKv.mp4\n' +
			'\n' +
			'Please react with :pencil2: to understand how you can stay up to date in the DAO.',
		'fq7': 'Even though you’ve made it to the DAO and have understood how Discord works, it can still feel overwhelming. To stay up to date, our Writers\' Guild has consistently produced a high-quality weekly rollup on all DAO activities.\n' +
			'\n' +
			'Your first quest on this journey west, O\' fellow Bankless adventurer, is to sign up and be the first in line to learn about BanklessDAO alpha – access to the discussions about NFT sales, Metafactory merch drops, inter-DAO projects, and so much more!\n' +
			'\n' +
			'https://banklessdao.substack.com/\n' +
			'\n' +
			'Please react with the :cowboy: icon to arrive at the last stage of your first-quest.',
		'fq8': '**Congratulations! You have reached the end of first quest**. \\n\\nIf you want to repeat first quest, you can reset your roles and start over by using the **/first-quest start** command.\\n',
	},
});

export default firstQuest;