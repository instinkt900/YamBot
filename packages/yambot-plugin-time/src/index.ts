import { BotTool, ToolPlugin } from 'yambot';
import { GetTimeTool } from './get_time.js';
import { ConvertUnixTimeTool } from './convert_time.js';

class TimeToolPlugin implements ToolPlugin {
    getPlugins(): Record<string, BotTool> {
        return {
            timeGet: new GetTimeTool(),
            timeConvert: new ConvertUnixTimeTool()
        };
    }
}

export const plugin = new TimeToolPlugin();
