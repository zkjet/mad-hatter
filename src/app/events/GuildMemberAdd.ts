import { GuildMember } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import ServiceUtils from '../utils/ServiceUtils';
import { LogUtils } from '../utils/Log';
import { sendFqMessage } from '../service/first-quest/LaunchFirstQuest';
import client from '../app';
import { Captcha } from 'discord.js-captcha';
import fqConstants from '../service/constants/firstQuest';

export default class implements DiscordEvent {
	name = 'guildMemberAdd';
	once = false;

	async execute(member: GuildMember): Promise<any> {
		if (member.user.bot) return;
		try {
			if (member.partial) {
				member = await member.fetch();
			}
			
			if (await ServiceUtils.runUsernameSpamFilter(member)) {
				return;
			} else {
				const captchaOptions = {
					guildID: member.guild.id,
					roleID: fqConstants.FIRST_QUEST_ROLES.verified,
					channelID: process.env.DISCORD_CHANNEL_SUPPORT_ID,
					kickOnFailure: false,
					attempts: 1,
					timeout: 180000,
					showAttemptCount: true,
				};
				
				const captcha1 = new Captcha(client, captchaOptions);
				captcha1.present(member);
				handleCaptchaSuccess(member, captcha1);
				
				captcha1.on('failure', () => {
					const captcha2 = new Captcha(client, captchaOptions);
					captcha2.present(member);
					handleCaptchaSuccess(member, captcha2);
					
					captcha2.on('failure', () => {
						captchaOptions.kickOnFailure = true;
						const captcha3 = new Captcha(client, captchaOptions);
						captcha3.present(member);
						handleCaptchaSuccess(member, captcha3);
						
						captcha3.on('timeout', () => {
							member.kick('captcha timeout');
							
						});
					});
					
					captcha2.on('timeout', () => {
						member.kick('captcha timeout');
					});
				});
				
				captcha1.on('timeout', () => {
					member.kick('captcha timeout');
				});
				
			}
		} catch (e) {
			LogUtils.logError('failed to process event guildMemberAdd', e);
		}
	}
}

const handleCaptchaSuccess = (member: GuildMember, captcha: Captcha) => {
	captcha.on('success', async () => {
		await member.roles.add(fqConstants.FIRST_QUEST_ROLES.verified);
		await sendFqMessage('undefined', member).catch(e => {
			LogUtils.logError('First attempt to launch first-quest failed: ', e);
		});
	});
};

