import {
	ApplicationCommandPermissionType,
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import roleIds from '../../service/constants/roleIds';
import ServiceUtils from '../../utils/ServiceUtils';
import ValidationError from '../../errors/ValidationError';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';
import LaunchSquad from '../../service/squad/LaunchSquad';
import { GuildMember } from 'discord.js';

export default class Squad extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'squad',
			description: 'Squad Commands',
			guildIDs: [discordServerIds.banklessDAO, discordServerIds.discordBotGarage],
			options: [
				{
					name: 'up',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Assemble a Squad',
					options: [],
				},
			],
			throttling: {
				usages: 4,
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
						id: roleIds.admin,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.genesisSquad,
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
						id: roleIds.admin,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.genesisSquad,
						permission: true,
					},
				],
			},
		});
	}

	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		let guildMember: GuildMember;
		try {
			({ guildMember } = await ServiceUtils.getGuildAndMember(ctx));
		} catch (e) {
			LogUtils.logError('failed to get guild Member', e);
			return;
		}
		let command: Promise<any>;
		switch (ctx.subcommands[0]) {
		case 'up':
			command = LaunchSquad(guildMember, ctx);
			break;
		default:
			return ctx.send(`${ctx.user.mention} Please try again.`);
		}

		this.handleCommandError(ctx, command);
	}

	handleCommandError(ctx: CommandContext, command: Promise<any>): void {
		command.catch(async e => {
			if (!(e instanceof ValidationError)) {
				await ServiceUtils.sendOutErrorMessage(ctx);
				return;
			}
		});
	}
}