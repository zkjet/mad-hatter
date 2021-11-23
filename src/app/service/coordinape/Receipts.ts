import { GuildMember } from 'discord.js';
import { CommandContext } from 'slash-create';
import axios, { AxiosRequestConfig } from 'axios';
import Log, { LogUtils } from '../../utils/Log';
import { handleNoEpochs } from './HandleNoEpoc';

// /receipts - Get all the allocations that you have received
export const Receipts = async (guildMember: GuildMember, ctx: CommandContext): Promise<any> => {
	const config: AxiosRequestConfig = {
		method: 'post',
		url: 'https://api.coordinape.com/receipts',
		headers: {
		},
		data: {
			username: guildMember.user.username,
		},
	};
	try {
		const response = await axios.post('/receipts', config);
		Log.info('Coordinape receipts response', {
			indexMeta: true,
			meta: {
				data: response.data,
			},
		});

		const { resUser, resCircle, recievedGits } = response.data;

		if (resCircle.epochs == 0) {
			return handleNoEpochs(guildMember, ctx, resUser);
		}


	} catch (e) {
		LogUtils.logError('Failed to send Give request to Coordinape', e);
		Log.debug('Coordinape Give response', {
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