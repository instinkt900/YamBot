import { BotCommand } from '../bot-command';
import { snark } from './snark';

export const commands: Record<string, BotCommand> = {
    snark: snark
};
