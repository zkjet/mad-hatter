import { GuildMember } from 'discord.js';
import { CommandContext } from 'slash-create';
import axios, { AxiosRequestConfig } from 'axios';
import Log, { LogUtils } from '../../utils/Log';
import { handleNoEpochs } from './HandleNoEpoc';

// /give - Add username, tokens and note (optional) after the command separated by a space e.g /give @zashtoneth 20 thank you note
export const Give = async (guildMember: GuildMember, ctx: CommandContext, recipient: string, amount: number, note: string): Promise<any> => {
	const config: AxiosRequestConfig = {
		method: 'post',
		url: 'https://api.coordinape.com/give',
		headers: {
		},
		data: {
			username: guildMember.user.username,
			recipient: recipient,
			amount: amount,
			note: note,
		},
	};
	try {
		const response = await axios.post('/give', config);
		Log.info('Coordinape /Give response', {
			indexMeta: true,
			meta: {
				data: response.data,
			},
		});

		const { resUser, resCircle, resRecipient, resAmount } = response.data;

		if (resCircle.epochs == 0) {
			return handleNoEpochs(guildMember, ctx, resUser);
		}

		const noteOnlyMsg = `${resUser.username} ser, you have successfully sent a note to ${resRecipient.username}.`;
		const noteAndGiftMsg = `${resUser.username} ser, you have suucessfully allocated ${resAmount} tokens to ${resRecipient.username}. You have ${resUser.give_token_remaining} tokes remaining.`;
		
		return;
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