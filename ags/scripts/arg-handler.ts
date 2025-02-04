import { Windows } from "./windows";
import { restartInstance } from "./reload-handler";

export function handleArguments(request: string): any {
    const args: Array<string> = request.split(" ");
    switch(args[0]) {
        case "open":
        case "close":
        case "toggle":
            return handleWindowArgs(args);

        case "help":
        case "h":
            return getHelp(); // stop it, get some help

        case "reload":
            restartInstance({ log: true, instanceName: "astal" });
            return "Reloading instance..."

        default:
            return "command not found! try checking help";
    }
}

// Didn't want to bloat the switch statement, so I just separated it into functions
export function handleWindowArgs(args: Array<string>): string {
    const windows = Windows.getDefault().getWindows();
    const window = windows[args[1] as never];

    if(args[1] == undefined || args[1] == "") 
        return "Window argument not specified!";

    if(!Object.hasOwn(windows, args[1]!)) 
        return `Window "${args[1]}" not found windows list!`

    switch(args[0]) {
        case "open":
            if(!Windows.getDefault().isVisible(window)) {
                Windows.getDefault().open(window);
                return `Setting visibility of window "${args[1]}" to true`;
            }

            return `Window is already open, ignored`;

        case "close":
            if(Windows.getDefault().isVisible(window)) {
                Windows.getDefault().close(window);
                return `Setting visibility of window "${args[1]}" to false`
            }

            return `Window is already closed, ignored`

        case "toggle":
            if(!Windows.getDefault().isVisible(window)) {
                Windows.getDefault().open(window);
                return `Toggle opening window "${args[1]}"`;
            }

            Windows.getDefault().close(window);
            return `Toggle closing window "${args[1]}"`
    }

    return "Couldn't handle window management arguments"
}

export function getHelp(): string {
    return `Manage Astal Windows and do more stuff. From
retrozinndev's Hyprland Dots, using Astal and AGS by Aylur.

Options:
  open [window_name]: sets specified window's visibility to true.
  close [window_name]: sets specified window's visibility to false.
  toggle [window_name]: toggles visibility of specified window.
  reload: creates a new astal instance and removes this one.
  help, -h, --help: shows this help message.

2024 (c) retrozinndev's Hyprland-Dots, licensed under the MIT License.
https://github.com/retrozinndev/Hyprland-Dots`
}
