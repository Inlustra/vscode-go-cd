export interface GoCdConfiguration {
    url: string;
    username?: string;
    password?: string;
    pipeline?: string;
    refreshInterval: number;
}
