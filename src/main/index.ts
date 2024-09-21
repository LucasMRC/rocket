import { app, shell, BrowserWindow, desktopCapturer, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.ico?asset';
import log from 'electron-log/main';
import fs from 'fs';

log.initialize();
log.info('Main process: Initializing');

let sourceId: string;
let mainWindow: BrowserWindow;
let settingsWindow: BrowserWindow;
let config: Config;

try {
	const configFile = fs.readFileSync(join(__dirname, '../config.json'), 'utf-8');
	config = JSON.parse(configFile);
} catch (error: any) {
	if (error.code === 'ENOENT') {
		log.info('Main process: Config file not found, creating new one');
		config = {
			format: 'mp4',
			savePath: '',
			defaultScreen: 'Screen 1'
		};
		fs.writeFileSync(join(__dirname, '../config.json'), JSON.stringify(config, null, 2));
	} else log.error('Main process: Error reading config file', error);
}

function updateConfig(newConfig: Config) {
	log.info('Main process: Updating config');
	try {
		fs.writeFileSync(join(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
		config = newConfig;
	} catch (error: any) {
		log.error('Main process: Error updating config', error);
	}
}

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 130,
		height: 48,
		useContentSize: false,
		icon,
		hasShadow: false,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		resizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			nodeIntegration: true,
			contextIsolation: false,
			sandbox: false
		}
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId('com.electron');

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow();

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	log.info('Main process: Shutting down');
	app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('GET_SOURCES', async () => {
	log.info('Main process: Requesting sources');
	return await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: {
			width: 600,
			height: 400
		}
	});
});

ipcMain.handle('GET_CONFIG', () => {
	log.info('Main process: Requesting config');
	return config;
});

ipcMain.handle('SHOW_DIALOG', async (_, { action, name }) => {
	if (action === 'save') {
		log.info('Main process: Opening save dialog');
		return await dialog.showSaveDialog({
			title: 'Save video',
			buttonLabel: 'Save',
			defaultPath: `${config.savePath}/${name}.${config.format}`,
		});
	} else if (action === 'change_save_path') {
		log.info('Main process: Opening change save path dialog');
		return await dialog.showOpenDialog({
			title: 'Change save path',
			buttonLabel: 'Select',
			properties: ['openDirectory']
		});
	}
	log.error('Main process: Invalid dialog action');
	return
});

ipcMain.handle('GET_OPERATIVE_SYSTEMS', () => {
	return process.platform;
});

ipcMain.handle('SCREEN_SELECTED', (_event, displayId) => {
	sourceId = displayId;
	mainWindow.webContents.send('SOURCE_UPDATED', sourceId);
});

ipcMain.handle('SECONDARY_WINDOW', (_event, options: SecondaryWindowOptions) => {
	if (options.action === 'open') {
		log.info('Main process: Opening secondary window', options.screen);
		const screen = new BrowserWindow({
			parent: mainWindow,
			width: 600,
			height: 364,
			transparent: true,
			frame: false,
			alwaysOnTop: true,
			autoHideMenuBar: true,
			movable: true,
			roundedCorners: true,
			resizable: false,
			modal: true,
			webPreferences: {
				preload: join(__dirname, '../preload/index.js'),
				nodeIntegration: true,
				contextIsolation: false,
				sandbox: false
			},
			...(process.platform === 'linux' ? { icon } : {})
		});
		const template = `${options.screen}.html`;
		screen.on('ready-to-show', () => {
			screen.show();
		});
		if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
			screen.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${template}`);
		} else {
			screen.loadFile(join(__dirname, `../renderer/${template}`));
		}
		if (options.screen === 'settings') {
			settingsWindow = screen;
		}
	} else {
		log.info('Main process: Closing secondary window');
		if (options.screen === 'settings') {
			updateConfig(options.config);
			sourceId = options.sourceId;
			settingsWindow.hide();
			mainWindow.webContents.send('SOURCE_UPDATED', sourceId);
		}
	}
});
