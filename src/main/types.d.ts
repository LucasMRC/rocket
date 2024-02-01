type SecondaryWindowOptions = {
    action: 'open'
} | {
    action: 'close';
    sourceId: number;
}