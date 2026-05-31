/**
 * TypeScript interfaces for raw AiSEG2 API response structures.
 */

// ============================================================================
// Wireless Device (from /page/setting/installation/7314)
// Parsed from JSON inside init() calls in <script> tags.
// ============================================================================

export interface RawWirelessDevice {
    /** Device display name */
    devName: string;
    /** Device manufacturer */
    devMaker: string;
    /** Device type hex string, e.g. '0x92' for switch */
    devType: string;
    /** Device identifier, format like 'xxx+yyy' */
    deviceId: string;
    /** Product code (hex-encoded string) */
    productCode: string;
    /** Node ID of the device */
    nodeId: string;
    /** EOJ (Object Relationship) classification */
    eoj: string;
    /** Unique network identifier */
    uniqueNo: string;
}

// ============================================================================
// Version Device (from /page/setting/installation/7315)
// Parsed from JSON inside init({list:[...]}) call in <script> tags.
// ============================================================================

export interface RawVersionDevice {
    nodeId: string;
    eoj: string;
    type: string;
    device: string;
    location: string;
    version: string;
    pvlimitVersion: string;
    pvlimitSupported: string;
}

// ============================================================================
// Network Device (from /page/setting/installation/7322)
// Structure not yet fully reverse-engineered; placeholder for future use.
// ============================================================================

export interface RawNetworkDevice {
    /** Placeholder — actual fields to be determined from 7322 page */
    [key: string]: unknown;
}

// ============================================================================
// Device State (from /data/devices/device/32i1/auto_update → panelData[])
// ============================================================================

export interface Aiseg2DeviceState {
    /** Device identifier used as lookup key */
    id: string;
    /** Current state: 'on' | 'off' */
    state: string;
    /** Human-readable state label */
    state_label: string;
    /** Disable state string */
    disable: string;
    /** On/Off index label */
    index_onoff: string;
    /** Modulate hidden state string */
    modulate_hidden: string;
    /** Modulation level (0–100) */
    modulate_level: number;
}

// ============================================================================
// Auto Update Request Payload (POST to /data/devices/device/32i1/auto_update)
// ============================================================================

export interface AutoUpdatePayload {
    page: string;
    list: Aiseg2Node[];
}

// ============================================================================
// Device Change Request Payload (POST to /action/devices/device/32i1/change)
// ============================================================================

export interface DeviceChangePayload {
    token: string;
    nodeId: string;
    eoj: string;
    type: string;
    device: {
        onoff: string;
        modulate: string;
    };
}

// ============================================================================
// Device Change Response (from /action/devices/device/32i1/change)
// ============================================================================

export interface DeviceChangeResponse {
    /** Result code: '0' = success, non-zero = failure */
    result: string;
    /** Accept ID for async status polling */
    acceptId: string | number;
}

// ============================================================================
// Device Check Request Payload (POST to /data/devices/device/32i1/check)
// ============================================================================

export interface DeviceCheckPayload {
    acceptId: string | number;
    type: string;
}

// ============================================================================
// Device Check Response (from /data/devices/device/32i1/check)
// ============================================================================

export interface DeviceCheckResponse {
    /** '0' = OK, '1' = in progress, '2' = invalid */
    result: string;
}

// ============================================================================
// Auto Update Response (from /data/devices/device/32i1/auto_update)
// ============================================================================

export interface AutoUpdateResponse {
    panelData: Aiseg2DeviceState[];
}

// ============================================================================
// Re-export Aiseg2Node from platform so consumers can import from here
// ============================================================================

export interface Aiseg2Node {
    nodeId: string;
    eoj: string;
    type: string;
    nodeIdentNum: string;
    deviceId: string;
}
