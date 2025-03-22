import { BotTool, ToolPlugin } from 'yambot';
import { AddReminderTool } from './add_reminder.js';
import { ClearRemindersTool } from './clear_reminders.js';
import { GetRemindersTool } from './get_reminders.js';

class ReminderToolPlugin implements ToolPlugin {
    getPlugins(): Record<string, BotTool> {
        return {
            reminderAdd: new AddReminderTool(),
            reminderGet: new GetRemindersTool(),
            reminderClear: new ClearRemindersTool()
        };
    }
}

export const plugin = new ReminderToolPlugin();
