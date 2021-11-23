import { GuildMember } from 'discord.js';
import { CommandContext } from 'slash-create';
import axios, { AxiosRequestConfig } from 'axios';
import Log, { LogUtils } from '../../utils/Log';
import { handleNoEpochs } from './HandleNoEpoc';

// /ungive - Deallocate all your existing tokens that you have given
export const Ungive = async (guildMember: GuildMember, ctx: CommandContext) => {
	const config: AxiosRequestConfig = {
		method: 'post',
		url: 'https://api.coordinape.com/ungive',
		headers: {
		},
		data: {
			username: guildMember.user.username,
		},
	};
	try {
		const response = await axios.post('/ungive', config);
		Log.info('Coordinape Ungive response', {
			indexMeta: true,
			meta: {
				data: response.data,
			},
		});

		const { user, circle } = response.data;

		if (circle.epochs == 0) {
			return handleNoEpochs(guildMember, ctx, user);
		}

		return await ctx.send(`${user.username} ser, You have deallocated all your tokens, you now have ${user.startingTokens} tokens remaining.`);
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