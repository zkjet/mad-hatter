import {
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import ServiceUtils from '../../utils/ServiceUtils';
import ConfigureFirstQuest from '../../service/first-quest/ConfigureFirstQuest';
import ValidationError from '../../errors/ValidationError';
import discordServerIds from '../../service/constants/discordServerIds';
import Log, { LogUtils } from '../../utils/Log';
import FirstQuestPOAP from '../../service/first-quest/FirstQuestPOAP';
import fqConstants from '../../service/constants/firstQuest';
import { switchRoles } from '../../service/first-quest/LaunchFirstQuest';

module.exports = class FirstQuest extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'first-quest',
			description: 'First Quest Commands',
			guildIDs: [discordServerIds.banklessDAO, discordServerIds.discordBotGarage],
			options: [
				{
					name: 'start',
					type: CommandOptionType.SUB_COMMAND,
					description: '(Re)start First Quest',
					options: [],
				},
				{
					name: 'config',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Configure First Quest Message Content',
					options: [],
				},
				{
					name: 'poap-refill',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Update POAP claim links',
					options: [
						{
							name: 'refill-type',
							type: CommandOptionType.STRING,
							description: 'Add (POAP is same as current) or replace (It\'s a new POAP) POAPs ',
							required: true,
							choices: [
								{
									name: 'add',
									value: 'ADD',
								},
								{
									name: 'replace',
									value: 'REPLACE',
								},
							],
						},
					],
				},

			],
			throttling: {
				usages: 1,
				duration: 1,
			},
			defaultPermission: true,
		});
	}

	async run(ctx: CommandContext) {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let command: Promise<any>;
		try {
			switch (ctx.subcommands[0]) {
			case 'start':
				if (!await guildMember.roles.cache.find(role => role.id === fqConstants.FIRST_QUEST_ROLES.first_quest_complete)) {
					if (await guildMember.roles.cache.find(role => role.id === fqConstants.FIRST_QUEST_ROLES.verified)) {
						await guildMember.roles.remove(fqConstants.FIRST_QUEST_ROLES.verified).catch(Log.error);
					}
					ctx?.send(`Hi, ${ctx.user.mention}! First Quest was launched, please check your DM and make sure they are activated.`);
					command = guildMember.roles.add(fqConstants.FIRST_QUEST_ROLES.verified).catch(Log.error);
				} else {
					ctx?.send(`Hi, ${ctx.user.mention}! First Quest was launched, please check your DM and make sure they are activated.`);
					command = switchRoles(guildMember, fqConstants.FIRST_QUEST_ROLES.first_quest_complete, fqConstants.FIRST_QUEST_ROLES.verified);
				}
				break;
			case 'config':
				command = ConfigureFirstQuest(guildMember, ctx);
				break;
			case 'poap-refill':
				command = FirstQuestPOAP(guildMember, ctx);
				break;
			default:
				return ctx.send(`${ctx.user.mention} Please try again.`);
			}
		} catch {
			this.handleCommandError(ctx, command);
		}
	}

	handleCommandError(ctx: CommandContext, command: Promise<any>) {
		command.catch(e => {
			if (e instanceof ValidationError) {
				return ctx.send({ content: `${e.message}`, ephemeral: true });
			} else {
				LogUtils.logError('failed to handle first-quest command', e);
				return ServiceUtils.sendOutErrorMessage(ctx);
			}
		});
	}

};