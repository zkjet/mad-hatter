import {
	ApplicationCommandPermissionType,
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import roleIds from '../../service/constants/roleIds';
import ServiceUtils from '../../utils/ServiceUtils';
import CreateNewScoapPoll from '../../service/scoap-squad/CreateNewScoapPoll';
import ValidationError from '../../errors/ValidationError';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';
import { command } from '../../utils/SentryUtils';

export default class ScoapSquad extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'scoap-squad',
			description: 'Create or delete a SCOAP Squad request',
			guildIDs: [discordServerIds.discordBotGarage],
			options: [
				{
					name: 'assemble',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Create a SCOAP Squad request',
					options: [],
				},
				
			],
			throttling: {
				usages: 2,
				duration: 1,
			},
			defaultPermission: false,
			permissions: {
				[discordServerIds.discordBotGarage]: [
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level1,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level2,
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

	@command
	async run(ctx: CommandContext): Promise<void> {
		await ctx.send({ content: 'TBD' });
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let commandPromise: Promise<any>;
		switch (ctx.subcommands[0]) {
		case 'assemble':
			commandPromise = CreateNewScoapPoll(guildMember, ctx);
			break;
		default:
			await ctx.send(`${ctx.user.mention} Please try again.`);
			return;
		}

		this.handleCommandError(ctx, commandPromise);
	}

	handleCommandError(ctx: CommandContext, commandPromise: Promise<any>): void {
		commandPromise.catch(e => {
			if (!(e instanceof ValidationError)) {
				LogUtils.logError('failed to handle scoap-squad command', e);
				return ServiceUtils.sendOutErrorMessage(ctx);
			}
		});
	}
	
}