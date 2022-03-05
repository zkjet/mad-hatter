import { GuildMember, Message, MessageReaction, User } from 'discord.js';
import channelIds from '../../service/constants/channelIds';
import Log, { LogUtils } from '../../utils/Log';
import { claimSquad, unclaimSquad } from '../../service/squad/LaunchSquad';
import { Db } from 'mongodb';
import dbInstance from '../../utils/MongoDbUtils';
import constants from '../../service/constants/constants';

export default async (reaction: MessageReaction, user: User, toggle: string): Promise<any> => {
	if (reaction.message.channel.id !== channelIds.SQUAD) {
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

	Log.debug('message reaction valid for squad up');

	const guildMember: GuildMember = await reaction.message.guild.members.fetch(user);

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	const record = await dbSquad.findOne({ '_id': message.embeds[0].footer.text });


	if (reaction.emoji.name === '🙋') {
		Log.debug('hand raise emoji');

		if (toggle === 'ADD') {
			Log.debug('toggle ADD');

			return claimSquad(guildMember.user, message, 'CLAIM').catch(e => LogUtils.logError('failed to claim squad', e));

		} else if (toggle === 'REMOVE') {
			Log.debug('toggle REMOVE');

			return unclaimSquad(guildMember.user, message, 'UNCLAIM').catch(e => LogUtils.logError('failed to un-claim squad', e));
		}

	} else if ((reaction.emoji.name === '❌') && (toggle === 'ADD')) {
		if (user.id === record.authorId) {
			Log.debug('❌ emoji && toggle ADD by authorized user');

			await message.reactions.removeAll()
				.catch(error => LogUtils.logError('Squad: failed to clear reactions:', error));

			await message.react('🔃');

			await dbSquad.updateOne({ _id: record._id }, { $set: { active: false } }, { upsert: true });

		}
		return;
	} else if ((reaction.emoji.name === '🔃') && (toggle === 'ADD')) {
		if (user.id === record.authorId) {
			Log.debug('🔃 emoji && toggle ADD by authorized user');

			await message.reactions.removeAll()
				.catch(error => LogUtils.logError('Squad: failed to clear reactions:', error));

			await message.react('🙋');
			await message.react('❌');

			await dbSquad.updateOne({ _id: record._id }, { $set: { active: true, created: Date.now() } }, { upsert: true });
		}
		return;
	}
};