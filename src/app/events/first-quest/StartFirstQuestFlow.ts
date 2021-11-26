import fqConstants from '../../service/constants/firstQuest';
import channelIds from '../../service/constants/channelIds';
import client from '../../app';
import { GuildMember } from 'discord.js';
import { Captcha } from 'discord.js-captcha';
import Log from '../../utils/Log';

const StartFirstQuestFlow = async (guildMember: GuildMember): Promise<void> => {
	Log.debug(`starting first quest flow for new user ${guildMember.user.tag}`);
	
	const captchaOptions = getCaptchaOptions(guildMember, false);

	const captcha = new Captcha(client, captchaOptions);
	
	runSuccessAndTimeout(guildMember, captcha, false);
	captcha.present(guildMember);
	Log.debug(`captcha sent to ${guildMember.user.tag}`);
	
	captcha.on('failure', () => {
		const captcha2 = new Captcha(client, captchaOptions);
		runSuccessAndTimeout(guildMember, captcha, false);
		setTimeout(() => {
			captcha2.present(guildMember);
		}, 2000);
		Log.debug(`captcha sent to ${guildMember.user.tag}`);
		
		captcha2.on('failure', () => {
			const captchaOptions3 = getCaptchaOptions(guildMember, true);
			const captcha3 = new Captcha(client, captchaOptions3);
			Log.debug(`captcha sent to ${guildMember.user.tag}`);
			
			runSuccessAndTimeout(guildMember, captcha, true);
			setTimeout(() => {
				captcha3.present(guildMember);
			}, 3000);
		});
	});
};

const runSuccessAndTimeout = (guildMember: GuildMember, captcha: any, isKickOnFailureSet: boolean) => {
	captcha.on('success', async () => {
		await guildMember.roles.add(fqConstants.FIRST_QUEST_ROLES.verified).catch(Log.error);
	});
	
	if (!isKickOnFailureSet) {
		captcha.on('timeout', async () => {
			await guildMember.kick('captcha timeout').catch(Log.error);
		});
	}
};

const getCaptchaOptions = (guildMember: GuildMember, kickOnFailure: boolean) => {
	return {
		guildID: guildMember.guild.id,
		roleID: fqConstants.FIRST_QUEST_ROLES.verified,
		channelID: channelIds.captchaVerification,
		kickOnFailure: kickOnFailure,
		attempts: 1,
		timeout: 180000,
		showAttemptCount: true,
		caseSensitive: true,
		sendToTextChannel: true,
	};
};

export default StartFirstQuestFlow;