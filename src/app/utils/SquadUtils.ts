import { GuildMember } from 'discord.js';
import ValidationError from '../errors/ValidationError';

const SquadUtils = {

	async validateSummary(guildMember: GuildMember, summary: string): Promise<any> {
		const CREATE_SUMMARY_REGEX = /^[\w\s\W]{1,4000}$/;
		if (summary == null || !CREATE_SUMMARY_REGEX.test(summary)) {
			await guildMember.send({
				content: `<@${guildMember.user.id}>\n` +
					'Please enter a valid summary: \n' +
					'- 4000 characters maximum\n ' +
					'- alphanumeric\n ' +
					'- special characters: .!@#$%&,?',
			});
			throw new ValidationError('invalid summary');
		}
	},

	async validateTitle(guildMember: GuildMember, title: string): Promise<any> {
		const CREATE_TITLE_REGEX = /^[\w\s\W]{1,250}$/;
		if (title == null || !CREATE_TITLE_REGEX.test(title)) {
			await guildMember.send({
				content: `<@${guildMember.user.id}>\n` +
					'Please enter a valid title: \n' +
					'- 250 characters maximum\n ' +
					'- alphanumeric\n ' +
					'- special characters: .!@#$%&,?',
			});
			throw new ValidationError('Please try another title.');
		}
	},
};

export default SquadUtils;