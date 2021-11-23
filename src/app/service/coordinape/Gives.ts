import { GuildMember } from 'discord.js';
import { CommandContext } from 'slash-create';
import axios, { AxiosRequestConfig } from 'axios';
import Log, { LogUtils } from '../../utils/Log';

// Get list of all the allocations that you have sent
export const Gives = async (guildMember: GuildMember, ctx: CommandContext) => {

	const config: AxiosRequestConfig = {
		method: 'get',
		url: 'https://api.coordinape.com/',
		headers: {
			username: guildMember.user.username,
		},
	};
	try {
		const response = await axios.get('/gives', config);
		Log.info('Coordinape Gives response', {
			indexMeta: true,
			meta: {
				data: response.data,
			},
		});
		return response.data;

        
	} catch (e) {
		LogUtils.logError('Failed to send Gives request to Coordinape', e);
		Log.debug('Coordinape Gives response', {
			indexMeta: true,
			meta: {
				error: e.toJSON,
				responseHeaders: e.response.headers,
				responseStatus: e.response.status,
				responseData: e.response.data,
			},
		});
		if (e.response.status == '400') {
			await guildMember.send({
				content: `Hmmm 🤔, this is what I found: ${e.response.data.message}`,
			});
		}
		throw new Error();
	}
};