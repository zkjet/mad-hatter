import { CommandContext } from 'slash-create';
import * as Sentry from '@sentry/node';

// eslint-disable-next-line @typescript-eslint/ban-types
export function command(target: Object, propertyKey: string, descriptor: PropertyDescriptor): any {
	const originalValue = descriptor.value;
	descriptor.value = async function(...args: any[]) {
		const ctx = args[0] as CommandContext;

		const transaction = Sentry.startTransaction({
			op: 'command',
			name: ctx.commandName,
		});

		Sentry.configureScope(scope => {
			scope.setSpan(transaction);
			scope.setUser({
				id: ctx.member.user.id,
				username: ctx.member.user.username,
				discriminator: ctx.member.user.discriminator,
				nickname: ctx.member.nick,
			});
			scope.setTags({
				guild: ctx.guildID,
				channel: ctx.channelID,
			});
		});

		let result: any;

		try {
			result = await originalValue.apply(this, args);
		} catch (e) {
			Sentry.captureException(e);
		} finally {
			transaction.finish();
		}

		return result;
	};
}