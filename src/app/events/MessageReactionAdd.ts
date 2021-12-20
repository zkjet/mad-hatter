import { MessageReaction, PartialUser, User } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import { LogUtils } from '../utils/Log';

export default class implements DiscordEvent {
	name = 'messageReactionAdd';
	once = false;
	
	async execute(reaction: MessageReaction, user: User | PartialUser): Promise<any> {
		try {
			// When a reaction is received, check if the structure is partial
			if (reaction.partial) {
				await reaction.fetch();
			}

			if (user.partial) {
				try {
					await user.fetch();
				} catch (error) {
					LogUtils.logError('failed to pull user partial', error);
					return;
				}
			}

			if (user.bot) {
				return;
			}
		} catch (e) {
			LogUtils.logError('failed to process event messageReactionAdd', e);
		}
	}
}
