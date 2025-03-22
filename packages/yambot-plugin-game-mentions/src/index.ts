import { BotTool, ToolPlugin } from 'yambot';
import { AddGameMentionTool } from './add_mention.js';
import { RemoveGameMentionTool } from './remove_mention.js';
import { GetGameMentionsTool } from './get_mentions.js';

export const test = 'test';

class GameMentionsToolPlugin implements ToolPlugin {
    getPlugins(): Record<string, BotTool> {
        return {
            gameMentionAdd: new AddGameMentionTool(),
            gameMentionRemove: new RemoveGameMentionTool(),
            gameMentionGetAll: new GetGameMentionsTool()
        };
    }
}

export const plugin = new GameMentionsToolPlugin();
