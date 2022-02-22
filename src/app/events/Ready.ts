import GuestPassService from '../service/guest-pass/GuestPassService';
import { Client, Guild } from 'discord.js';
import constants from '../service/constants/constants';
import discordServerIds from '../service/constants/discordServerIds';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import Log, { LogUtils } from '../utils/Log';
import MongoDbUtils from '../utils/MongoDbUtils';
import SquadCronJob from '../service/squad/SquadCronJobs';

export default class implements DiscordEvent {
	name = 'ready';
	once = true;

	async execute(client: Client): Promise<any> {
		try {
			Log.info(`${constants.APP_NAME} is getting ready!`);
			
			client.user.setActivity(process.env.DISCORD_BOT_ACTIVITY);
			client.guilds.cache.forEach((guild: Guild) => {
				Log.info(`${constants.APP_NAME} active for: ${guild.id}, ${guild.name}`);
			});
			await MongoDbUtils.connect(constants.DB_NAME_DEGEN);

			if (client.guilds.cache.some((guild) => guild.id == discordServerIds.banklessDAO || guild.id == discordServerIds.discordBotGarage)) {
				await GuestPassService(client).catch(Log.error);
				await SquadCronJob().catch(Log.error);
			}
			
			Log.info(`${constants.APP_NAME} is ready!`);
		} catch (e) {
			LogUtils.logError('Error processing event ready', e);
		}
	}
}
