import { CommandContext } from 'slash-create';
import * as Sentry from '@sentry/node';

export function command(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalValue = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        let ctx = args[0] as CommandContext;

        const transaction = Sentry.startTransaction({
            op: "command",
            name: ctx.commandName
        });

        Sentry.configureScope(scope => {
            scope.setSpan(transaction);
            scope.setUser({
                username: ctx.users[0]
            })
        });

        try {
            var result = await originalValue.apply(this, args);
        } catch (e) {
            Sentry.captureException(e);
        } finally {
            transaction.finish();
        }

        return result;
    }
}