import { Message } from 'discord.js';
import degenPhrases from '../../service/constants/degenPhrases';
import Log, { LogUtils } from '../../utils/Log';
import constants from '../../service/constants/constants';

const MessageCreateOnDEGEN = async (message: Message): Promise<void> => {
	try {
		const content: string = message.content;
		
		// POAP
		if (content.match(/POAP/gi)) {
			await message.channel.send({
				content: `${degenPhrases.poap[Math.floor(Math.random() * degenPhrases.poap.length)]}`,
			}).catch(Log.error);
			return;
		}
	
		// APP name
		if (content.match(/Mad Hatter/gi) || message.mentions.has(constants.DISCORD_BOT_USER_ID)) {
			await message.channel.send({
				content: `${degenPhrases.app[Math.floor(Math.random() * degenPhrases.app.length)]}`,
			}).catch(Log.error);
			return;
		}
		
		// gm
		if (content.match(/gm/g)) {
			await message.channel.send({
				content: 'gm',
			}).catch(Log.error);
			return;
		}
	} catch (e) {
		LogUtils.logError('failed to reply back message in channel regex', e);
	}
};

export default MessageCreateOnDEGEN;