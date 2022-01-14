import {
	ApplicationCommandPermissionType,
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import roleIds from '../../service/constants/roleIds';
import ServiceUtils from '../../utils/ServiceUtils';
import CoordinapeSendForm from '../../service/coordinape/CoordinapeSendForm';
import ValidationError from '../../errors/ValidationError';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';
import { command } from '../../utils/SentryUtils';

export default class Coordinape extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'coordinape',
			description: 'Manage Coordinape rounds',
			guildIDs: [discordServerIds.discordBotGarage, discordServerIds.banklessDAO],
			options: [
				{
					name: 'form-request',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Send link to Coordinape round',
					options: [],
				},
			],
			throttling: {
				usages: 50,
				duration: 1,
			},
			defaultPermission: false,
			permissions: {
				[discordServerIds.banklessDAO]: [
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level2,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level1,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.guestPass,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level3,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level4,
						permission: true,
					},
				],
				[discordServerIds.discordBotGarage]: [
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level2,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level1,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.guestPass,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level3,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level4,
						permission: true,
					},
				],
			},
		});
	}

	@command
	async run(ctx: CommandContext): Promise<void> {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let commandPromise: Promise<any>;
		switch (ctx.subcommands[0]) {
		case 'form-request':
			commandPromise = CoordinapeSendForm(guildMember, ctx);
			break;
		default:
			await ctx.send({ content: `${ctx.user.mention} Please try again.`, ephemeral: true });
			return;
		}

		this.handleCommandError(ctx, commandPromise);
	}

	handleCommandError(ctx: CommandContext, commandPromise: Promise<any>): void {
		commandPromise.catch(e => {
			if (!(e instanceof ValidationError)) {
				LogUtils.logError('failed to handle coordinape command', e);
				return ServiceUtils.sendOutErrorMessage(ctx);
			}
		});
	}

}