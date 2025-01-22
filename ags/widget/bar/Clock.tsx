import { Box, Button } from "astal/gtk3/widget";
import { GLib, Variable } from "astal";

const dateTimeFormat = "%A %d, %H:%M"
const time = new Variable<string>("").poll(600, () => 
    GLib.DateTime.new_now_local().format(dateTimeFormat)!);

export function Clock(): JSX.Element {
    return (
        <Box className={"clock"}>
            <Button label={time()} />
        </Box>
    )
}
