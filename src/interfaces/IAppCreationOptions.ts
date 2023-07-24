export interface AppCreationOptions {
    cors: boolean;
    httpsOptions?: {
        cert?: Buffer;
        key?: Buffer;
    };
    
}