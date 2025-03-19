import { BotTool, BotToolParameter } from '.';
import { YamBot } from '../bot';

class AddReminderToolImpl implements BotTool {
    private _list: string[];

    constructor(list: string[]) {
        this._list = list;
    }

    get description(): string {
        return 'adds a reminder to the list';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            description: { type: 'string', description: 'a description of the reminder' }
        };
    }
    async execute(bot: YamBot, message: string): Promise<string> {
        this._list.push(message);
        return 'success';
    }
}

class GetRemindersToolImpl implements BotTool {
    private _list: string[];

    constructor(list: string[]) {
        this._list = list;
    }

    get description(): string {
        return 'gets the current list of reminders';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {};
    }
    async execute(_bot: YamBot): Promise<string> {
        return JSON.stringify({ reminders: this._list });
    }
}

class ClearRemindersToolImpl implements BotTool {
    private _list: string[];

    constructor(list: string[]) {
        this._list = list;
    }

    get description(): string {
        return 'clears all current reminders';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {};
    }
    async execute(_bot: YamBot): Promise<string> {
        this._list.length = 0;
        return 'success';
    }
}

const reminderList: string[] = [];
export const AddReminderTool = new AddReminderToolImpl(reminderList);
export const GetRemindersTool = new GetRemindersToolImpl(reminderList);
export const ClearRemindersTool = new ClearRemindersToolImpl(reminderList);
