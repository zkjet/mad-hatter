import {
	CommandContext,
	CommandOptionType, MessageOptions,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import { LogUtils } from '../../utils/Log';
import HowToBounty from '../../service/help/HowToBounty';
import { command } from '../../utils/SentryUtils';

export default class Help extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'help',
			description: 'Learn to manage bounties, add guests and more',
			options: [
				{
					name: 'bounty',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Learn about managing bounties',
				},
			],
			throttling: {
				usages: 3,
				duration: 1,
			},
			defaultPermission: true,
		});
	}
	
	@command
	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		
		let messageOptions: MessageOptions;
		switch (ctx.subcommands[0]) {
		case 'bounty':
			messageOptions = HowToBounty();
			break;
		}
		return ctx.send(messageOptions);
	}
}