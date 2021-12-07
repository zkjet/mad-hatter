import {
	CommandContext,
	CommandOptionType, MessageOptions,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import { LogUtils } from '../../utils/Log';
import HowToBounty from '../../service/help/HowToBounty';
import { traceCommand } from '../../utils/TraceUtils';

export default class Help extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'help',
			description: 'Additional information on creating bounties, adding guests, and other operations.',
			options: [
				{
					name: 'bounty',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Information on how to create, claim, complete, and delete bounties.',
				},
			],
			throttling: {
				usages: 3,
				duration: 1,
			},
			defaultPermission: true,
		});
	}
	
	@traceCommand
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