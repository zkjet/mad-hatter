import { Message } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import MessageCreateOnDEGEN from './chat/MessageCreateOnDEGEN';
import { LogUtils } from '../utils/Log';
import HandleAFK from './chat/HandleAFK';

export default class implements DiscordEvent {
	name = 'messageCreate';
	once = false;

	async execute(message: Message): Promise<any> {
		try {
			if(message.author.bot) return;
			// DEGEN says hello
			await MessageCreateOnDEGEN(message).catch(e => {
				LogUtils.logError('Mad Hatter failed to say hello', e);
			});
			// Check mentions for AFK users
			if (message.mentions.users.size > 0) {
				await HandleAFK(message).catch((e) => {
					LogUtils.logError('Mad Hatter failed to handle AFK', e);
				});
			}
		} catch (e) {
			LogUtils.logError('failed to process event messageCreate', e);
		}
	}
}
