import { pino } from 'pino';

export const logger = pino({
	name: 'Yoshino',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			messageKey: 'msg',
			translateTime: true,
		},
	},
});
