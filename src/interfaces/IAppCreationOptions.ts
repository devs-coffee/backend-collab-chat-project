export interface AppCreationOptions {
    cors: { origin: boolean, credentials: boolean};
    httpsOptions?: {
        cert?: Buffer;
        key?: Buffer;
    };
    
}