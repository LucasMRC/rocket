type SecondaryWindowOptions = {
	action: 'open';
	screen: 'settings';
} | {
	action: 'close';
	screen: 'settings';
	config: Config;
	sourceId: string;
}; 

type Config = {
	savePath: string;
	format: string;
	defaultScreen: string;
};
