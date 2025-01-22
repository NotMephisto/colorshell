import { readFile } from "astal";
import { getUserDirs } from "./user";

export abstract class Wal {
    getColors(): JSON {
        return JSON.parse(
            readFile(`${getUserDirs().cache}/wal/colors.json`)!
        );
    }
}
