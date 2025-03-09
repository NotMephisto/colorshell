import { Tile, TileProps } from "./Tile";
import { Recording } from "../../../scripts/recording";
import { bind } from "astal";

export const TileRecording = Tile({
    title: "Screen Recording",
    description: bind(Recording.getDefault(), "recording").as(
        (isRecording: boolean) => isRecording ? 
            "Recording {time}" 
        : "Start a Screen Record"
    ),
    icon: "󰻂",
    onToggledOff: () => Recording.getDefault().stopRecording(),
    onToggledOn: () => Recording.getDefault().startRecording(),
    iconSize: 16,
    toggleState: bind(Recording.getDefault(), "recording"),
} as TileProps);
