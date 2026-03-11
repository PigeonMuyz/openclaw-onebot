/**
 * OneBot WebSocket 服务（含自动无限重连）
 */

import type { OneBotMessage } from "./types.js";
import { getOneBotConfig } from "./config.js";
import { connectForward, createServerAndWait, setWs, stopConnection, handleEchoResponse, startImageTempCleanup, stopImageTempCleanup } from "./connection.js";
import { processInboundMessage } from "./handlers/process-inbound.js";
import { handleGroupIncrease } from "./handlers/group-increase.js";
import { startScheduler, stopScheduler } from "./scheduler.js";

const RECONNECT_BASE_MS = 3000;
const RECONNECT_MAX_MS = 60000;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect = true;

function clearReconnectTimer(): void {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
}

function setupWsListeners(ws: any, api: any): void {
    ws.on("message", (data: Buffer) => {
        try {
            const payload = JSON.parse(data.toString());
            if (handleEchoResponse(payload)) return;
            if (payload.meta_event_type === "heartbeat") return;

            const msg = payload as OneBotMessage;
            if (msg.post_type === "message" && (msg.message_type === "private" || msg.message_type === "group")) {
                processInboundMessage(api, msg).catch((e) => {
                    api.logger?.error?.(`[onebot] processInboundMessage: ${e?.message}`);
                });
            } else if (msg.post_type === "notice" && msg.notice_type === "group_increase") {
                handleGroupIncrease(api, msg).catch((e) => {
                    api.logger?.error?.(`[onebot] handleGroupIncrease: ${e?.message}`);
                });
            }
        } catch (e: any) {
            api.logger?.error?.(`[onebot] parse message: ${e?.message}`);
        }
    });

    ws.on("close", () => {
        api.logger?.warn?.("[onebot] WebSocket closed");
        setWs(null);
        scheduleReconnect(api, 0);
    });

    ws.on("error", (e: Error) => {
        api.logger?.error?.(`[onebot] WebSocket error: ${e?.message}`);
    });
}

function scheduleReconnect(api: any, attempt: number): void {
    if (!shouldReconnect) return;
    clearReconnectTimer();
    const delay = Math.min(RECONNECT_BASE_MS * Math.pow(2, attempt), RECONNECT_MAX_MS);
    api.logger?.info?.(`[onebot] 将在 ${(delay / 1000).toFixed(0)}s 后重连（第 ${attempt + 1} 次）`);
    reconnectTimer = setTimeout(() => doConnect(api, attempt + 1), delay);
}

async function doConnect(api: any, attempt: number): Promise<void> {
    if (!shouldReconnect) return;
    const config = getOneBotConfig(api);
    if (!config) {
        api.logger?.warn?.("[onebot] no config, skip reconnect");
        return;
    }
    try {
        let ws;
        if (config.type === "forward-websocket") {
            ws = await connectForward(config);
        } else {
            ws = await createServerAndWait(config);
        }
        setWs(ws);
        api.logger?.info?.("[onebot] WebSocket connected" + (attempt > 0 ? `（重连成功，第 ${attempt} 次尝试）` : ""));
        setupWsListeners(ws, api);
    } catch (e: any) {
        api.logger?.warn?.(`[onebot] connect failed: ${e?.message}`);
        scheduleReconnect(api, attempt);
    }
}

export function registerService(api: any): void {
    api.registerService({
        id: "onebot-ws",
        start: async () => {
            shouldReconnect = true;
            startImageTempCleanup();
            startScheduler(api);
            await doConnect(api, 0);
        },
        stop: async () => {
            shouldReconnect = false;
            clearReconnectTimer();
            stopImageTempCleanup();
            stopScheduler();
            stopConnection();
            api.logger?.info?.("[onebot] service stopped");
        },
    });
}
