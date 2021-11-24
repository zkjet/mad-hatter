import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';


export default class FeatureRequest extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'roll',
			description: 'Roll a number between 0 and 100',
			guildIDs: [discordServerIds.banklessDAO, discordServerIds.discordBotGarage],
			throttling: {
				usages: 2,
				duration: 1,
			},
			defaultPermission: true,
		});
	}

	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		// Ignores commands from bots
		if (ctx.user.bot) return;
		await ctx.send(`${ctx.user.username} rolled ${Math.floor(Math.random() * 101)}!`);
	}
}