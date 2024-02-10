import { app, shell, BrowserWindow, desktopCapturer, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

let sourceId: string;
let mainWindow: BrowserWindow;
let screensPickerWindow: BrowserWindow;
let settingsWindow: BrowserWindow;

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
        },
        ...(process.platform === 'linux' ? { icon } : {})
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
    app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('GET_SOURCES', async () => {
    return await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
            width: 600,
            height: 400
        }
    });
});

ipcMain.handle('SHOW_SAVE_DIALOG', async () => {
    return await dialog.showSaveDialog({
        title: 'Save video',
        buttonLabel: 'Save',
        defaultPath: `${Date.now()}.webm`
    });
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
        const screen = new BrowserWindow({
            parent: mainWindow,
            width: 600,
            height: 300,
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
        } else {
            screensPickerWindow = screen;
        }
    } else {
        if (options.screen === 'settings') {
            settingsWindow.hide();

        } else {
            sourceId = options.sourceId;
            screensPickerWindow.hide();
            mainWindow.webContents.send('SOURCE_UPDATED', sourceId);
        }
    }
});
