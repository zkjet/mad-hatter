import {
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import roleIds from '../../service/constants/roleIds';
import ServiceUtils from '../../utils/ServiceUtils';
import ConfigureFirstQuest from '../../service/first-quest/ConfigureFirstQuest';
import ValidationError from '../../errors/ValidationError';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';
import FirstQuestPOAP from '../../service/first-quest/FirstQuestPOAP';
import { sendFqMessage, switchRoles } from '../../service/first-quest/LaunchFirstQuest';
import fqConstants from '../../service/constants/firstQuest';

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
				try {
					if (!await guildMember.roles.cache.find(role => role.id === fqConstants.FIRST_QUEST_ROLES.first_quest_complete)) {
						ctx?.send(`Hi, ${ctx.user.mention}! First Quest was launched, please check your DM and make sure they are activated.`);
						command = sendFqMessage('undefined', guildMember).catch(e => {
							LogUtils.logError('/first-quest start failed', e);
						});
					} else {
						await switchRoles(guildMember, fqConstants.FIRST_QUEST_ROLES.first_quest_complete, fqConstants.FIRST_QUEST_ROLES.verified);
						try {
							ctx?.send(`Hi, ${ctx.user.mention}! First Quest was launched, please check your DM and make sure they are activated.`);
							command = sendFqMessage('undefined', guildMember).catch(e => {
								LogUtils.logError('/first-quest start failed', e);
							});

						} catch {
							await new Promise(r => setTimeout(r, 1000));

							return await sendFqMessage('undefined', guildMember).catch(e => {
								LogUtils.logError('/first-quest start failed', e);
							});
						}
					}
				} catch (e) {
					LogUtils.logError('/first-quest start failed', e);
				}
				break;
			case 'config':
				for (const role of guildMember.roles.cache.values()) {
					if (role.id === roleIds.level2) {
						command = ConfigureFirstQuest(guildMember, ctx);
						return;
					}
				}
				return ctx.send(`Hi ${ctx.user.mention}, this command is only available for Level 2 Contributors.`);
				break;
			case 'poap-refill':
				for (const role of guildMember.roles.cache.values()) {
					if (role.id === roleIds.level2) {
						command = FirstQuestPOAP(guildMember, ctx);
						return;
					}
				}
				return ctx.send(`Hi ${ctx.user.mention}, this command is only available for Level 2 Contributors.`);
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
			if (!(e instanceof ValidationError)) {
				LogUtils.logError('failed to handle first-quest command', e);
				return ctx.send('Sorry something is not working and our devs are looking into it');
			}
		});
	}

};