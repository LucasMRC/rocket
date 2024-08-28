type SecondaryWindowOptions = {
	action: 'open';
	screen: 'settings' | 'screens';
} | {
	action: 'close';
} & ({
	screen: 'screens';
	sourceId: string;
} | {
	screen: 'settings';
}); 
