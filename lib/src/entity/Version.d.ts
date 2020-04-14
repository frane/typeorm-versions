import { ObjectLiteral, Connection } from 'typeorm';
export declare enum VersionEvent {
    INSERT = "INSERT",
    UPDATE = "UPDATE",
    REMOVE = "REMOVE"
}
export declare class Version {
    id: number;
    itemType: string;
    itemId: string;
    event: VersionEvent;
    owner: string;
    object: ObjectLiteral;
    timestamp: Date;
    protected getConnection(): Connection;
    getObject<T>(): T;
    previous(): Promise<Version | undefined>;
    next(): Promise<Version | undefined>;
    index(): Promise<number | undefined>;
}
//# sourceMappingURL=Version.d.ts.map