import { GuildMember, Message, MessageReaction, User } from 'discord.js';
import channelIds from '../../service/constants/channelIds';
import Log, { LogUtils } from '../../utils/Log';
import { claimSquad } from '../../service/squad/LaunchSquad';
import { Db } from 'mongodb';
import dbInstance from '../../utils/MongoDbUtils';
import constants from '../../service/constants/constants';

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

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	const record = await dbSquad.findOne({ '_id': message.embeds[0].footer.text });


	if (reaction.emoji.name === '🙋') {
		return claimSquad(guildMember.user, message, 'CLAIM').catch(e => LogUtils.logError('failed to claim squad', e));
	} else if (reaction.emoji.name === '❌') {
		if (user.id === record.authorId) {
			await message.reactions.removeAll()
				.catch(error => LogUtils.logError('Squad: failed to clear reactions:', error));
		}
		return;
	}
};