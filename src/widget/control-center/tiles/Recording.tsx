import { Tile } from "./Tile";
import { Recording } from "../../../modules/recording";
import { tr } from "../../../i18n/intl";
import { isInstalled, time } from "../../../modules/utils";
import { createBinding, createComputed } from "ags";


export const TileRecording = () => 
    <Tile title={tr("control_center.tiles.recording.title")}
      description={createComputed([
          createBinding(Recording.getDefault(), "recording"),
          time
      ], (recording, dateTime) => {
          if(!recording || !Recording.getDefault().startedAt) 
              return tr("control_center.tiles.recording.disabled_desc") || "Start recording";

          const startedAtSeconds = dateTime.to_unix() - Recording.getDefault().startedAt!;
          if(startedAtSeconds <= 0) return "00:00";

          const minutes = Math.floor(startedAtSeconds / 60);
          const seconds = Math.floor(startedAtSeconds % 60);

          return `${ minutes < 10 ? `0${minutes}` : minutes }:${ seconds < 10 ? `0${seconds}` : seconds }`;
      })}
      icon={"media-record-symbolic"}
      visible={isInstalled("wf-recorder")}
      onDisabled={() => Recording.getDefault().stopRecording()}
      onEnabled={() => Recording.getDefault().startRecording()}
      state={createBinding(Recording.getDefault(), "recording")}
    />;
