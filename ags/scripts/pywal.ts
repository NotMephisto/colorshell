import { readFile } from "astal";
import { getUserDirs } from "./user";

export class Wal {
    public static getColors(): JSON {
        return JSON.parse(
            readFile(`${getUserDirs().cache}/wal/colors.json`)!
        );
    }
}
