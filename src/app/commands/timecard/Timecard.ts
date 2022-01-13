import {
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import ValidationError from '../../errors/ValidationError';
import ServiceUtils from '../../utils/ServiceUtils';
import Checkin from '../../service/timecard/Checkin';
import Checkout from '../../service/timecard/Checkout';
import Hours from '../../service/timecard/Hours';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';
import { command } from '../../utils/SentryUtils';

export default class Timecard extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'timecard',
			description: 'Checkin, checkout, and calculate total hours',
			guildIDs: [process.env.DISCORD_SERVER_ID, discordServerIds.discordBotGarage],
			options: [
				{
					name: 'checkin',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Initiate time card',
				},
				{
					name: 'checkout',
					type: CommandOptionType.SUB_COMMAND,
					description: 'End and log timecard',
					options: [
						{
							name: 'description',
							type: CommandOptionType.STRING,
							description: 'Log what you worked on',
							required: true,
						},
					],
				},
				{
					name: 'hours',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Calculate total hours worked',
				},
			],
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
		if (ctx.user.bot) return;

		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let commandPromise: Promise<any>;
		
		try {
			switch (ctx.subcommands[0]) {
			case 'checkin':
				commandPromise = Checkin(guildMember, Date.now());
				break;
			case 'checkout':
				commandPromise = Checkout(guildMember, Date.now(), ctx.options.checkout['description']);
				break;
			case 'hours':
				commandPromise = Hours(guildMember);
				break;
			default:
				return ctx.send(`${ctx.user.mention} Please try again.`);
			}
			this.handleCommandError(ctx, commandPromise);
		} catch (e) {
			LogUtils.logError('failed processing timecard', e);
		}
	}

	handleCommandError(ctx: CommandContext, commandPromise: Promise<any>): void {
		commandPromise.then(() => {
			return ctx.send(`${ctx.user.mention} Sent you a DM with information.`);
		}).catch(e => {
			if (e instanceof ValidationError) {
				return ctx.send({ content: `${e.message}`, ephemeral: true });
			} else {
				LogUtils.logError('failed to handle timecard command', e);
				return ServiceUtils.sendOutErrorMessage(ctx);
			}
		});
	}
}