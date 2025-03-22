import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

export class DynamicConfigFile {
    private _configPath: string;
    private _subConfigs: Map<string, DynamicConfigFile> = new Map();
    private _watchers: Map<string, fs.FSWatcher> = new Map();
    public _events: EventEmitter = new EventEmitter();

    constructor(configPath: string) {
        this._configPath = configPath;
    }

    _getBaseDir(): string {
        return path.dirname(this._configPath);
    }

    protected _loadConfig() {
        this._clearWatchers();

        let configObj;
        try {
            configObj = JSON.parse(fs.readFileSync(this._configPath, 'utf-8'));
        } catch (error) {
            console.log(`Error parsing JSON data in '${this._configPath}'`, error);
        }
        this._watchFile(this._configPath, () => this._loadConfig());

        this._expandConfig(configObj, path.dirname(this._configPath));

        for (const key in this) {
            if (key.startsWith('_')) {
                continue;
            }
            if (!(key in configObj)) {
                delete this[key];
            }
        }
        Object.assign(this, configObj);

        this._onChanged();
    }

    private _onChanged() {
        this._events.emit('changed', this);
    }

    private _expandConfig(obj: any, baseDir: string) {
        for (const key in obj) {
            const val = obj[key];
            const prefix = 'file:';
            if (typeof val === 'string' && val.startsWith('file:')) {
                const pathVal = val.slice(prefix.length);
                const fullPath = path.resolve(baseDir, pathVal);
                // json entry appears to be a file reference
                if (fullPath.endsWith('.json')) {
                    // json references get merged into base
                    this._loadSubConfig(fullPath, obj, key);
                } else if (fullPath.endsWith('.txt')) {
                    // txt references just get added as the value
                    this._loadTextConfig(fullPath, obj, key);
                }
            } else if (typeof val === 'object' && val !== null) {
                this._expandConfig(val, baseDir);
            }
        }
    }

    private _loadSubConfig(fullPath: string, obj: { [key: string]: any }, key: string) {
        const configFile = new DynamicConfigFile(fullPath);
        configFile._loadConfig();
        obj[key] = configFile;
        this._subConfigs.set(key, configFile);
        configFile._events.on('changed', (configObj) => {
            const obj = this as { [key: string]: any };
            obj[key] = configObj;
            this._onChanged();
        });
    }

    private _loadTextConfig(fullPath: string, obj: { [key: string]: any }, key: string) {
        try {
            const textData = fs.readFileSync(fullPath, 'utf-8');
            obj[key] = textData;
        } catch (error) {
            console.log(`Failed reading '${fullPath}'`, error);
        }
        this._watchFile(fullPath, () => {
            if (!fs.existsSync(fullPath)) {
                return;
            }
            this._loadTextConfig(fullPath, this, key);
            this._onChanged();
        });
    }

    private _watchFile(filePath: string, onChange: () => void) {
        const existing = this._watchers.get(filePath);
        if (existing) {
            existing.close();
        }
        const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
                onChange();
            }
        });
        this._watchers.set(filePath, watcher);
    }

    private _clearWatchers() {
        for (const value of this._subConfigs.values()) {
            value._clearWatchers();
        }
        for (const value of this._watchers.values()) {
            value.close();
        }
        this._subConfigs.clear();
        this._watchers.clear();
    }
}
