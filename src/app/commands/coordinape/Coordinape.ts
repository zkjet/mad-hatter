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

module.exports = class Coordinape extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'coordinape',
			description: 'Commands to manage Coordinape rounds',
			guildIDs: [discordServerIds.discordBotGarage, discordServerIds.banklessDAO],
			options: [
				{
					name: 'form-request',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Send correct for to coordinape participants.',
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

	async run(ctx: CommandContext) {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let command: Promise<any>;
		switch (ctx.subcommands[0]) {
		case 'form-request':
			command = CoordinapeSendForm(guildMember, ctx);
			break;
		default:
			return ctx.send({ content: `${ctx.user.mention} Please try again.`, ephemeral: true });
		}

		this.handleCommandError(ctx, command);
	}

	handleCommandError(ctx: CommandContext, command: Promise<any>) {
		command.catch(e => {
			if (!(e instanceof ValidationError)) {
				LogUtils.logError('failed to handle coordinape command', e);
				return ServiceUtils.sendOutErrorMessage(ctx);
			}
		});
	}

};