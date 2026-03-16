declare module "hotreload" {
    export interface hotReloadOptions {
        excluded?: string[];
        onlyReload?: string[];
        functionsToLoad?: {
            pathGlob: string;
            callbackFunction: (path: string, pull: any) => void;
        }[];
        /**
         * Optional CommonJS require for ESM environments.
         */
        req?: NodeJS.Require;
    }

    export interface hotReloadReturnData {
        success: string[];
        failed: {
            path: string;
            error: TypeError;
        }[];
    }

    export function hotReload(options: hotReloadOptions): Promise<hotReloadReturnData>;

    export namespace Utils {
        function loadAllPaths(
            paths: string[],
            functionPaths: { pathGlob: string; callbackFunction: (path: string, pull: any) => void }[]
        ): Promise<void> | void;

        function filterStrings<T extends string>(str: T[]): T[];
    }
}

