import api from "@opentelemetry/api";
import { CommandContext } from "slash-create";

export function traceCommand(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalValue = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        let ctx = args[0] as CommandContext;
        let tracer = api.trace.getTracer('command-tracer');
        let span = tracer.startSpan('command.run');
        span.setAttribute("code.function", propertyKey);
        span.setAttribute("command.id", ctx.commandID);
		span.setAttribute("command.name", ctx.commandName);
		span.setAttribute("command.user", ctx.users[0]);
		span.setAttribute("command.subcommands", ctx.subcommands);	

        var result = await originalValue.apply(this, args);

		span.end();
        return result;
    }
}