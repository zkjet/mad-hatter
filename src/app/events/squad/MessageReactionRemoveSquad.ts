import { GuildMember, Message, MessageReaction, User } from 'discord.js';
import channelIds from '../../service/constants/channelIds';
import Log, { LogUtils } from '../../utils/Log';
import { unclaimSquad } from '../../service/squad/LaunchSquad';

export default async (reaction: MessageReaction, user: User): Promise<any> => {
	if (reaction.message.channel.id !== channelIds.scoapSquad) {
		return;
	}

	const message: Message = await reaction.message.fetch();

	if (message.embeds == null || message.embeds[0] == null) {
		return;
	}

	if (message === null) {
		Log.debug('message not found');
		return;
	}

	const guildMember: GuildMember = await reaction.message.guild.members.fetch(user);

	if (reaction.emoji.name === '🙋') {
		return unclaimSquad(guildMember.user, message, 'UNCLAIM').catch(e => LogUtils.logError('failed to un-claim squad', e));
	}
};