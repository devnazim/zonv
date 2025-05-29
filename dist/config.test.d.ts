export declare const createConfigFiles: (files: {
    path: string;
    data: any;
}[]) => Promise<{
    cleanup: () => Promise<void>;
}>;
