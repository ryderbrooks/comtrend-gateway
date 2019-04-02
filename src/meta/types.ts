export type RES<T> = ( value?: (T | Promise<T>) ) => void;
export type REJ = ( reason?: any ) => void;