import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { LogUtils } from '../../utils/Log';
import { command } from '../../utils/SentryUtils';

export default class FeatureRequest extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'feature-request',
			description: 'Retrieve feature request form',
			throttling: {
				usages: 2,
				duration: 1,
			},
			defaultPermission: true,
		});
	}

	@command
	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		// Ignores commands from bots
		if (ctx.user.bot) return;

		const form = 'https://airtable.com/shrCvG4C2SshXJRP4';
		await ctx.send(`Here you are ${ctx.user.mention}, the Mad Hatter feature request form: ${form}`);
	}
}