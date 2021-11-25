import { GuildMember } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import ServiceUtils from '../utils/ServiceUtils';
import Log, { LogUtils } from '../utils/Log';
import { sendFqMessage } from '../service/first-quest/LaunchFirstQuest';
import client from '../app';
import { Captcha } from 'discord.js-captcha';
import fqConstants from '../service/constants/firstQuest';
import channelIds from '../service/constants/channelIds';

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
			}
			
			const captchaOptions = {
				guildID: member.guild.id,
				roleID: fqConstants.FIRST_QUEST_ROLES.verified,
				channelID: channelIds.captchaVerification,
				kickOnFailure: false,
				attempts: 1,
				timeout: 180000,
				showAttemptCount: true,
				caseSensitive: true,
			};
			
			let attempts = 0;
			while (attempts < 3) {
				const captcha = new Captcha(client, captchaOptions);
				captcha.present(member);
				await waitForCaptcha(member, captcha).catch();
				attempts++;
			}
			
		} catch (e) {
			Log.error('failed to process event guildMemberAdd');
		}
	}
}

const waitForCaptcha = async (member: GuildMember, captcha: Captcha): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		captcha.on('success', async (data) => {
			console.log(data);
			await member.roles.add(fqConstants.FIRST_QUEST_ROLES.verified);
			// await sendFqMessage('undefined', member).catch(e => {
			// 	LogUtils.logError('First attempt to launch first-quest failed: ', e);
			// });
			resolve();
		});
		
		captcha.on('failure', data => {
			console.log(data);
			reject();
		});
		
		captcha.on('timeout', () => {
			member.kick('captcha timeout');
			reject();
		});
	});
};

