import {
	CommandContext,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import Log, { LogUtils } from '../../utils/Log';

export default class Help extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'help',
			description: 'TBD',
			options: [],
			throttling: {
				usages: 3,
				duration: 1,
			},
			defaultPermission: true,
		});
	}
	
	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		
		await ctx.send('https://discord.gg/C4xmJJUkMh').catch(Log.error);
	}
}