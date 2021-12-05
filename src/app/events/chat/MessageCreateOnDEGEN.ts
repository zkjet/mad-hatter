import {
	Channel,
	Message,
} from 'discord.js';
import degenPhrases from '../../service/constants/degenPhrases';
import Log, { LogUtils } from '../../utils/Log';
import constants from '../../service/constants/constants';

const MessageCreateOnDEGEN = async (message: Message): Promise<void> => {
	try {
		const content: string = message.content;

		// POAP
		if (content.match(/POAP/gi)) {
			await message.channel.sendTyping();
			await message.channel.send({
				content: `${degenPhrases.poap[Math.floor(Math.random() * degenPhrases.poap.length)]}`,
			}).catch(Log.error);
			return;
		}

		// APP name
		if (content.match(/Mad Hatter/gi) || message.mentions.has(constants.DISCORD_BOT_USER_ID)) {
			await message.channel.sendTyping();
			const phrase = degenPhrases.app[Math.floor(Math.random() * degenPhrases.app.length)];
			const degenMessage = await message.channel.send({ content: phrase }).catch(Log.error) as Message;

			if (phrase === 'This is your last chance. After this, there is no turning back. ' +
				'You take the blue pill - the story ends. You take the red pill - ' +
				'you stay in Wonderland, and I show you how deep the rabbit hole goes.') {

				try {
					await degenMessage.react('🔵');
					await degenMessage.react('🔴');
				} catch (e) {
					LogUtils.logError('message reaction failed', e);
				}
			}

			return;
		}

		// gm
		if (content.match(/gm/g)) {
			await message.channel.sendTyping();
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