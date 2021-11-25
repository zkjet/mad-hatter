import { GuildMember } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import ServiceUtils from '../utils/ServiceUtils';
import { LogUtils } from '../utils/Log';
import client from '../app';
import { Captcha } from 'discord.js-captcha';
import fqConstants from '../service/constants/firstQuest';
import { sendFqMessage } from '../service/first-quest/LaunchFirstQuest';

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
				await presentCaptcha(member, captcha1, 1, captchaOptions);
			
			}
		} catch (e) {
			LogUtils.logError('failed to process event guildMemberAdd', e);
		}
	}
}

const presentCaptcha = async (member: GuildMember, captcha: Captcha, attempts: number, captchaOptions) => {
	captcha.present(member);

	captcha.on('failure', () => {
		if (attempts <= 2) {
			presentCaptcha(member, new Captcha(client, captchaOptions), attempts + 1, captchaOptions);

		} else {
			captchaOptions.kickOnFailure = true;

			presentCaptcha(member, new Captcha(client, captchaOptions), attempts + 1, captchaOptions);
		}
	});

	captcha.on('timeout', () => {
		member.kick('captcha timeout');
	});

	captcha.on('success', async () => {
		await member.roles.add(fqConstants.FIRST_QUEST_ROLES.verified);

		await new Promise(r => setTimeout(r, 1000));

		await sendFqMessage('undefined', member).catch(e => {
			LogUtils.logError('First attempt to launch first-quest failed: ', e);
		});
	});
	
};
