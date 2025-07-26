import { timeout, GLib } from 'astal';
import { Gtk, Gdk, Widget } from 'astal/gtk3';
import AstalMpris from "gi://AstalMpris";
import { Wallpaper } from '../scripts/wallpaper';

let pauseProgress = 1; // 0 = full wave, 1 = full straight

export enum typeSliders {
    MATERIAL_EXPRESSIVE,
    CHUNKY_MODERN
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

function drawRoundedRectangle(cr, x, y, width, height, radius) {
    radius = Math.min(radius, height / 2, width / 2);
    cr.moveTo(x + radius, y);
    cr.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    cr.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
    cr.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
    cr.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    cr.closePath();
}

export function createUnifiedSlider(model: SliderOptions): Gtk.Widget {
    let isDragging = false;
    let dragProgress: number | null = null;

    const isPlayingStream = model.getMaxValue() < GLib.MAXINT64 / 10000000 ? false : true;

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
                        if (isPlayingStream) return;
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

                            isDragging = model.getPlaybackStatus ? timeout(30, () => { isDragging = false }) : false;
                        }
                    });


                    let drawLoopId: number | null = null;

                    self.connect('realize', () => {
                        if (drawLoopId === null) {
                            const fpm = Math.round(1000 / Wallpaper.getDefault().getRefreshRate());
                            drawLoopId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, fpm, () => {
                                if (self.get_window()?.is_visible()) {
                                    self.queue_draw();
                                }
                                return GLib.SOURCE_CONTINUE;
                            });
                        }
                    });

                    self.connect('draw', (self) => {
                        if (model.typeSlider() === typeSliders.MATERIAL_EXPRESSIVE) {
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
                        : (!isPlayingStream
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
                        case typeSliders.CHUNKY_MODERN: {

                            const barHeight = 15;
                            const centerY = height / 2;
                            const barRadius = Math.max(5, barHeight / 2);

                            const progressX = width * displayProgress;
                            
                            const rectangleHandleWidth = 10;
                            const rectangleHandleHeight = Math.max(barHeight + rectangleHandleWidth, Math.min(height - barHeight, barHeight + (barHeight / 2)));
                            const rectangleHandleX = Math.max(0, Math.min(progressX - (rectangleHandleWidth / 2), width - rectangleHandleWidth));
                            
                            const handleOffset = 5;
                            const activeEndX = rectangleHandleX - handleOffset;
                            const inactiveStartX = rectangleHandleX + rectangleHandleWidth + handleOffset;
                            
                            if (displayProgress > 0 && activeEndX > 0) {
                                colorStr ? cr.setSourceRGBA(color.red, color.green, color.blue, color.alpha) : cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);
                                drawRoundedRectangle(cr, 0, centerY - barHeight / 2, Math.max(0, activeEndX), barHeight, barRadius);
                                cr.fill();
                            }
                            
                            if (displayProgress < 1 && inactiveStartX < width) {
                                cr.setSourceRGBA(fg.red, fg.green, fg.blue, 0.3);
                                const inactiveWidth = width - inactiveStartX;
                                if (inactiveWidth > 0) {
                                    drawRoundedRectangle(cr, inactiveStartX, centerY - barHeight / 2, inactiveWidth, barHeight, barRadius);
                                    cr.fill();
                                }
                            }
                            
                            cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);
                            drawRoundedRectangle(cr, rectangleHandleX, centerY - rectangleHandleHeight / 2, rectangleHandleWidth, rectangleHandleHeight, barRadius);
                            cr.fill();
                            break;
                        }
                        case typeSliders.MATERIAL_EXPRESSIVE: {
                            const lineThickness = 6;
                            
                            const baseWaveAmp = 2;
                            const waveAmp = baseWaveAmp * (1 - pauseProgress);
                            const waveFreq = 0.15;
                            const time = Date.now() * 0.003;

                            const rectangleHandleWidth = 5;
                            const rectangleHandleHeight = 20;
                            const rectangleHandleX = Math.max(0, Math.min(width * displayProgress - (rectangleHandleWidth / 2), width - rectangleHandleWidth));

                            const centerY = height / 2;
                            const progressX = width * displayProgress;
                            const startX = lineThickness / 2;
                            const activeEndX = Math.max(0, progressX - rectangleHandleWidth * 2);

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

                            if (!isPlayingStream) {
                                cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);
                                drawRoundedRectangle(cr, rectangleHandleX, centerY - rectangleHandleHeight / 2, rectangleHandleWidth, rectangleHandleHeight, radius);
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
