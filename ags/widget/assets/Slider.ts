import { timeout, GLib } from 'astal';
import { Gtk, Gdk, Widget } from 'astal/gtk3';
import AstalMpris from "gi://AstalMpris";

let pauseProgress = 1; // 0 = full wave, 1 = full straight

export enum typeSliders {
    MATERIAL_EXPRESSIVE_WAVE, //For players
    MATERIAL_EXPRESSIVE_SLIDER 
}

export interface SliderOptions {
    getValue(): number;
    getMaxValue(): number;
    setValue(value: number): void;
    realtimeChangeValue(): boolean;
    getColor(): string | (() => string | null);
    typeSlider(): typeSliders;
    getPlaybackStatus?(): AstalMpris.PlaybackStatus;
}

function drawRoundedRectangleCustom(cr, x, y, width, height, radius, corners = {
    topLeft: true,
    topRight: true,
    bottomRight: true,
    bottomLeft: true
}) {
    radius = Math.min(radius, height / 2, width / 2);
    
    cr.moveTo(x + (corners.topLeft ? radius : 0), y);
    
    // Top rigth
    if (corners.topRight) {
        cr.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    } else {
        cr.lineTo(x + width, y);
        cr.lineTo(x + width, y + radius);
    }
    
    // Bottom rigth
    if (corners.bottomRight) {
        cr.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
    } else {
        cr.lineTo(x + width, y + height);
        cr.lineTo(x + width - radius, y + height);
    }
    
    // Bottom left
    if (corners.bottomLeft) {
        cr.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
    } else {
        cr.lineTo(x, y + height);
        cr.lineTo(x, y + height - radius);
    }
    
    // Top left
    if (corners.topLeft) {
        cr.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    } else {
        cr.lineTo(x, y);
        cr.lineTo(x + radius, y);
    }
    
    cr.closePath();
}


export function createUnifiedSlider(model: SliderOptions): Gtk.Widget {
    let isDragging = false;
    let dragProgress: number | null = null;

    const isStreamPlaying = model.getMaxValue() >= GLib.MAXINT64 / 10000000;

    return new Widget.EventBox({
        children: [
            new Widget.DrawingArea({
                className: "slider-drawing-area",
                hexpand: true,
                heightRequest: 30,

                setup: (self) => {
                    self.add_events(
                        Gdk.EventMask.BUTTON_PRESS_MASK |
                        Gdk.EventMask.BUTTON_RELEASE_MASK |
                        Gdk.EventMask.POINTER_MOTION_MASK
                    );

                    const updateDragPosition = (x: number) => {
                        const width = self.get_allocated_width();
                        if (width === 0) return;
                        dragProgress = Math.max(0, Math.min(x / width, 1));
                    };

                    self.connect('button-press-event', (_, event) => {
                        if (isStreamPlaying) return;
                        isDragging = true;
                        const [, x] = event.get_coords();
                        updateDragPosition(x);
                    });

                    self.connect('motion-notify-event', (_, event) => {
                        if (isDragging) {
                            const [, x] = event.get_coords();
                            updateDragPosition(x);

                            if (model.realtimeChangeValue() && dragProgress !== null) model.setValue(dragProgress * model.getMaxValue());
                        }
                    });

                    self.connect('button-release-event', () => {
                        if (isDragging && dragProgress !== null) {
                            const maxValue = model.getMaxValue();
                            if (maxValue > 0) {
                                model.setValue(dragProgress * maxValue);
                            }

                            isDragging = model.getPlaybackStatus ? timeout(40, () => { isDragging = false }) : false;
                        }
                    });


                    let drawLoopId: number | null = null;

                    self.connect('realize', () => {
                        if (drawLoopId === null) {
                            // 16 ms is about 60 fps, so if you want get more fps, use this formula: Math.round(1000 / RefreshRate)
                            const FrameToMilliseconds = 16; // ~60 fps
                            drawLoopId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FrameToMilliseconds, () => {
                                if (self.get_window()?.is_visible()) {
                                    self.queue_draw();
                                }
                                return GLib.SOURCE_CONTINUE;
                            });
                        }
                    });

                    self.connect('draw', (self) => {
                        if (model.typeSlider() === typeSliders.MATERIAL_EXPRESSIVE_WAVE) {
                            const playbackStatus = model.getPlaybackStatus ? model.getPlaybackStatus() : null;

                            if (playbackStatus === AstalMpris.PlaybackStatus.PLAYING) {
                                if (pauseProgress > 0) {
                                    pauseProgress = Math.max(0, pauseProgress - 0.03);
                                }
                            } else {
                                if (pauseProgress < 1) {
                                    pauseProgress = Math.min(1, pauseProgress + 0.03);
                                }
                            }
                        }
                    });

                    self.connect("destroy", () => {
                        if (drawLoopId !== null) {
                            GLib.source_remove(drawLoopId);
                            drawLoopId = null;
                        }
                    });
                },

                onDraw: (self, cr) => {
                    const styleContext = self.get_style_context();
                    const width = self.get_allocated_width();
                    const height = self.get_allocated_height();

                    const position = model.getValue();
                    const length = model.getMaxValue();

                    const currentProgress = length > 0 ? position / length : 0;
                    const displayProgress = (isDragging && dragProgress !== null)
                        ? dragProgress
                        : (!isStreamPlaying
                            ? currentProgress
                            : 1 //Max
                        );

                    const styleType = model.typeSlider();
                    const fg = styleContext.get_property('color', Gtk.StateFlags.NORMAL);
                    const rawColor = model.getColor;
                    const colorStr = typeof rawColor === 'function' ? rawColor() : rawColor;
                    const color = new Gdk.RGBA();
                    if (colorStr) color.parse(colorStr);

                    switch (styleType) {
                        case typeSliders.MATERIAL_EXPRESSIVE_SLIDER: {
                            const barHeight = 15;
                            const barRadius = Math.max(5, barHeight / 2);
                            const centerY = height / 2;
                            const progressX = width * displayProgress;

                            const handleWidth = 5;
                            const handleHeight = Math.max(barHeight + handleWidth, Math.min(height - barHeight, barHeight + barHeight / 2));
                            const handleX = Math.max(0, Math.min(progressX - handleWidth / 2, width - handleWidth));

                            const handleOffset = 5;
                            const activeEndX = handleX - handleOffset;
                            const inactiveStartX = handleX + handleWidth + handleOffset;

                            // Active line
                            if (displayProgress > 0 && activeEndX > 0) {
                                const colorToUse = colorStr ? color : fg;
                                cr.setSourceRGBA(colorToUse.red, colorToUse.green, colorToUse.blue, colorToUse.alpha);
                                drawRoundedRectangleCustom(
                                    cr,
                                    0, centerY - barHeight / 2,
                                    Math.max(0, activeEndX), barHeight, barRadius,
                                    { topLeft: true, topRight: false, bottomRight: false, bottomLeft: true }
                                );
                                cr.fill();
                            }

                            // Unactive line
                            const hasInactive = displayProgress < 1 && inactiveStartX < width;
                            if (hasInactive) {
                                const inactiveWidth = width - inactiveStartX;
                                if (inactiveWidth > 0) {
                                    cr.setSourceRGBA(fg.red, fg.green, fg.blue, 0.3);
                                    drawRoundedRectangleCustom(
                                        cr,
                                        inactiveStartX, centerY - barHeight / 2,
                                        inactiveWidth, barHeight, barRadius,
                                        { topLeft: false, topRight: true, bottomRight: true, bottomLeft: false }
                                    );
                                    cr.fill();
                                }
                            }

                            // Handle
                            cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);
                            drawRoundedRectangleCustom(
                                cr,
                                handleX, centerY - handleHeight / 2,
                                handleWidth, handleHeight, barRadius
                            );
                            cr.fill();

                            // Max Value Dot
                            if (hasInactive) {
                                const dotRadius = barHeight / 6;
                                const dotX = width - barHeight / 2;
                                const colorToUse = colorStr ? color : fg;

                                cr.save();
                                drawRoundedRectangleCustom(
                                    cr,
                                    inactiveStartX, centerY - barHeight / 2,
                                    width - inactiveStartX, barHeight, barRadius,
                                    { topLeft: false, topRight: true, bottomRight: true, bottomLeft: false }
                                );
                                cr.clip();

                                cr.setSourceRGBA(colorToUse.red, colorToUse.green, colorToUse.blue, colorToUse.alpha);
                                cr.newPath();
                                cr.arc(dotX, centerY, dotRadius, 0, 2 * Math.PI);
                                cr.fill();
                                cr.restore();
                            }

                            break;
                        }
                        case typeSliders.MATERIAL_EXPRESSIVE_WAVE: {
                            const lineThickness = 6;
                            
                            const baseWaveAmp = 3;
                            const waveAmp = baseWaveAmp * (1 - pauseProgress);
                            const waveFreq = 0.15;
                            const time = Date.now() * 0.003;

                            const rectangleHandleWidth = 5;
                            const rectangleHandleHeight = 20;
                            const rectangleHandleX = Math.max(0, Math.min(width * displayProgress - (rectangleHandleWidth / 2), width - rectangleHandleWidth));

                            const centerY = height / 2;
                            const progressX = width * displayProgress;
                            const startX = lineThickness / 2;
                            const activeEndX = Math.max(startX, progressX - rectangleHandleWidth * 2);

                            const radius = 10;

                            cr.setLineWidth(lineThickness);
                            cr.setLineCap(1); // ROUND caps

                            // Active part (wave or line)
                            if (activeEndX > startX) {
                                const src = colorStr ? color : fg;
                                cr.setSourceRGBA(src.red, src.green, src.blue, src.alpha);

                                cr.newPath();
                                cr.moveTo(startX, centerY + Math.sin(startX * waveFreq + time) * waveAmp);
                                for (let x = startX; x < activeEndX; x++) {
                                    const y = centerY + Math.sin(x * waveFreq + time) * waveAmp;
                                    cr.lineTo(x, y);
                                }
                                cr.stroke();
                            }

                            // Unactive part
                            const inactiveStartX = Math.max(lineThickness * 2, Math.min(width, progressX + rectangleHandleWidth * 2));
                            if (inactiveStartX < width - startX) {
                                cr.setSourceRGBA(fg.red, fg.green, fg.blue, 0.3);
                                cr.newPath();
                                cr.moveTo(inactiveStartX, centerY);
                                cr.lineTo(width - startX, centerY);
                                cr.stroke();
                            }

                            if (!isStreamPlaying) {
                                cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);
                                drawRoundedRectangleCustom(cr, rectangleHandleX, centerY - rectangleHandleHeight / 2, rectangleHandleWidth, rectangleHandleHeight, radius);
                                cr.fill();
                            }
                            break;
                        }
                    }
                }
            } as Widget.DrawingAreaProps)
        ]
    } as Widget.EventBoxProps)
}
