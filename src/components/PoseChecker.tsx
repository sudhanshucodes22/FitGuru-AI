import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CameraOff, CheckCircle, AlertTriangle, Info, Cpu, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

// MediaPipe types (loaded via CDN)
declare const Pose: any;
declare const Camera: any;
declare const POSE_CONNECTIONS: any;

interface PoseFeedback {
    score: number;
    status: 'good' | 'warn' | 'idle';
    tips: string[];
    reps: number;
}

interface ExerciseConfig {
    name: string;
    analyzeAngles: (landmarks: any[]) => PoseFeedback;
}

// Calculate angle between three points
function calcAngle(a: any, b: any, c: any): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
}

// MediaPipe landmark indices
const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

function isVisible(lm: any[], id: number) {
    return lm[id] && lm[id].visibility > 0.5;
}

function getAngleAndVisibility(lm: any[], idA: number, idB: number, idC: number) {
    if (!isVisible(lm, idA) || !isVisible(lm, idB) || !isVisible(lm, idC)) return null;
    return calcAngle(lm[idA], lm[idB], lm[idC]);
}

function getBestAngle(lm: any[], indicesLeft: number[], indicesRight: number[]) {
    const leftAngle = getAngleAndVisibility(lm, indicesLeft[0], indicesLeft[1], indicesLeft[2]);
    const rightAngle = getAngleAndVisibility(lm, indicesRight[0], indicesRight[1], indicesRight[2]);
    if (leftAngle !== null && rightAngle !== null) return (leftAngle + rightAngle) / 2;
    if (leftAngle !== null) return leftAngle;
    if (rightAngle !== null) return rightAngle;
    return null;
}

function checkAlignment(lm: any[], idL: number, idR: number) {
    if (!isVisible(lm, idL) || !isVisible(lm, idR)) return null;
    return Math.abs(lm[idL].y - lm[idR].y);
}

// Helper to construct custom AI training posture vector (Angles of key limbs)
function getPoseAngleVector(lm: any[]): number[] {
    const vector: number[] = [];
    const addAngle = (idA: number, idB: number, idC: number) => {
        const val = getAngleAndVisibility(lm, idA, idB, idC);
        vector.push(val !== null ? val : 180);
    };

    addAngle(LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST); // L_Elbow
    addAngle(LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST); // R_Elbow
    addAngle(LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW); // L_Shoulder
    addAngle(LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW); // R_Shoulder
    addAngle(LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE); // L_Hip
    addAngle(LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE); // R_Hip
    addAngle(LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE); // L_Knee
    addAngle(LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE); // R_Knee

    return vector;
}

function calculateVectorDifference(vec1: number[], vec2: number[]): number {
    let diff = 0;
    let count = 0;
    for (let i = 0; i < vec1.length; i++) {
        diff += Math.abs(vec1[i] - vec2[i]);
        count++;
    }
    return diff / count;
}

// Drawing Iron Man Tech HUD
function drawIronManHUD(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any[],
    exerciseName: string,
    statusColor: string
) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw Grid Lines (Futuristic Grid)
    ctx.strokeStyle = 'rgba(0, 255, 85, 0.04)';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }

    // Draw Connections
    connections.forEach(([i, j]: [number, number]) => {
        const lm1 = landmarks[i];
        const lm2 = landmarks[j];
        if (lm1 && lm2 && lm1.visibility > 0.5 && lm2.visibility > 0.5) {
            const x1 = lm1.x * ctx.canvas.width;
            const y1 = lm1.y * ctx.canvas.height;
            const x2 = lm2.x * ctx.canvas.width;
            const y2 = lm2.y * ctx.canvas.height;

            // Outer glow
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 5;
            ctx.strokeStyle = statusColor === '#00ff55' ? 'rgba(0, 255, 85, 0.35)' : statusColor === '#FF9100' ? 'rgba(255, 145, 0, 0.35)' : 'rgba(255, 23, 68, 0.35)';
            ctx.shadowBlur = 12;
            ctx.shadowColor = statusColor;
            ctx.stroke();

            // Inner core
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#FFFFFF';
            ctx.shadowBlur = 0;
            ctx.stroke();

            // Flow Particle (Pulse travelling along the bone connection)
            const t = ((Date.now() / 1200) + (i * 0.1)) % 1;
            const px = x1 + (x2 - x1) * t;
            const py = y1 + (y2 - y1) * t;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 8;
            ctx.shadowColor = statusColor;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Draw Tech Nodes
    landmarks.forEach((lm: any, index: number) => {
        if (lm.visibility > 0.5) {
            const x = lm.x * ctx.canvas.width;
            const y = lm.y * ctx.canvas.height;

            // Pulsing Ring
            const pulse = 1 + Math.sin(Date.now() / 150 + index) * 0.25;
            const radius = 5 * pulse;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fill();

            ctx.lineWidth = 1;
            ctx.strokeStyle = statusColor;
            ctx.shadowBlur = 6;
            ctx.shadowColor = statusColor;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Target Crosshair / Reticle for key nodes
            if ([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)) {
                // Draw tech brackets around the node
                const len = 6;
                const offset = 8;
                ctx.strokeStyle = statusColor;
                ctx.lineWidth = 1;

                // Top-Left bracket
                ctx.beginPath();
                ctx.moveTo(x - offset - len, y - offset);
                ctx.lineTo(x - offset, y - offset);
                ctx.lineTo(x - offset, y - offset - len);
                ctx.stroke();

                // Top-Right bracket
                ctx.beginPath();
                ctx.moveTo(x + offset + len, y - offset);
                ctx.lineTo(x + offset, y - offset);
                ctx.lineTo(x + offset, y - offset - len);
                ctx.stroke();

                // Bottom-Left bracket
                ctx.beginPath();
                ctx.moveTo(x - offset - len, y + offset);
                ctx.lineTo(x - offset, y + offset);
                ctx.lineTo(x - offset, y + offset + len);
                ctx.stroke();

                // Bottom-Right bracket
                ctx.beginPath();
                ctx.moveTo(x + offset + len, y + offset);
                ctx.lineTo(x + offset, y + offset);
                ctx.lineTo(x + offset, y + offset + len);
                ctx.stroke();

                // Data tag
                ctx.font = '7px "Courier New", monospace';
                ctx.fillStyle = statusColor;
                ctx.fillText(`P${index}`, x + offset + 2, y - offset - 2);
            }
        }
    });

    // Draw Face Lock Reticle (Index 0 is nose)
    const nose = landmarks[0];
    if (nose && nose.visibility > 0.5) {
        const nx = nose.x * ctx.canvas.width;
        const ny = nose.y * ctx.canvas.height;

        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate((Date.now() / 1000) * 0.4);

        // Rotating dashed circle
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, 2 * Math.PI);
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Brackets
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI / 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 16, Math.PI, 4 * Math.PI / 3);
        ctx.stroke();

        ctx.restore();

        // Label
        ctx.font = '7px "Courier New", monospace';
        ctx.fillStyle = statusColor;
        ctx.fillText("JARVIS_LOCK_00", nx + 28, ny - 10);
        
        ctx.beginPath();
        ctx.moveTo(nx + 18, ny - 13);
        ctx.lineTo(nx + 25, ny - 13);
        ctx.strokeStyle = statusColor;
        ctx.stroke();
    }

    // Draw active angles based on the current exercise
    if (exerciseName.includes("Press") || exerciseName.includes("Flyes") || exerciseName.includes("Dips") || exerciseName.includes("Pull-Ups") || exerciseName.includes("Curls") || exerciseName.includes("Pushups") || exerciseName === "Custom AI Trainer") {
        // Draw elbow angles
        drawAngleIndicator(ctx, landmarks, LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST, "L_ELBOW", statusColor);
        drawAngleIndicator(ctx, landmarks, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST, "R_ELBOW", statusColor);
    }
    if (exerciseName.includes("Squats") || exerciseName.includes("Lunge") || exerciseName.includes("Dips") || exerciseName.includes("Raises") || exerciseName.includes("Pushups") || exerciseName === "Custom AI Trainer") {
        // Draw knee or hip angles
        drawAngleIndicator(ctx, landmarks, LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE, "L_KNEE", statusColor);
        drawAngleIndicator(ctx, landmarks, LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE, "R_KNEE", statusColor);
    }

    // Top HUD Pitch/Roll Tape (Hollywood Style)
    const tapeY = 25;
    ctx.strokeStyle = 'rgba(0, 255, 85, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2 - 120, tapeY);
    ctx.lineTo(ctx.canvas.width / 2 + 120, tapeY);
    ctx.stroke();

    const scrollOffset = (Date.now() / 40) % 20;
    for (let x = ctx.canvas.width / 2 - 100; x <= ctx.canvas.width / 2 + 100; x += 10) {
        const adjustedX = x - scrollOffset;
        if (adjustedX < ctx.canvas.width / 2 - 100 || adjustedX > ctx.canvas.width / 2 + 100) continue;
        ctx.beginPath();
        ctx.moveTo(adjustedX, tapeY);
        ctx.lineTo(adjustedX, tapeY - (x % 20 === 0 ? 8 : 4));
        ctx.stroke();
    }

    // Compass Tape marker
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, tapeY - 2);
    ctx.lineTo(ctx.canvas.width / 2 - 5, tapeY - 12);
    ctx.lineTo(ctx.canvas.width / 2 + 5, tapeY - 12);
    ctx.closePath();
    ctx.fillStyle = statusColor;
    ctx.fill();

    // Heartbeat Biometrics ECG graph in the bottom-left corner of the canvas
    ctx.beginPath();
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1.2;
    const graphX = 20;
    const graphY = ctx.canvas.height - 25;
    const graphWidth = 120;
    ctx.moveTo(graphX, graphY);
    for (let i = 0; i < graphWidth; i++) {
        // Simulated ECG heart pulse
        const pulseCycle = (Date.now() / 800) % 1; // Pulse once every 800ms
        let spike = 0;
        const normalizedPos = i / graphWidth;
        const phase = (normalizedPos - pulseCycle + 1) % 1;
        if (phase < 0.1) {
            // Heartbeat spike sequence (P-Q-R-S-T)
            const tVal = phase / 0.1;
            if (tVal < 0.2) spike = Math.sin(tVal * Math.PI * 5) * 4; // P wave
            else if (tVal < 0.3) spike = 0; // Q wave flat
            else if (tVal < 0.4) spike = -8; // Q negative spike
            else if (tVal < 0.6) spike = 25; // R positive peak spike
            else if (tVal < 0.7) spike = -14; // S negative peak spike
            else if (tVal < 0.8) spike = 0; // flat
            else spike = Math.sin((tVal - 0.8) * Math.PI * 5) * 6; // T wave
        }
        
        ctx.lineTo(graphX + i, graphY - spike);
    }
    ctx.stroke();
    
    ctx.font = '7px "Courier New", monospace';
    ctx.fillStyle = statusColor;
    ctx.fillText("BIOMETRICS // SIGNAL LOCK", graphX, graphY - 18);

    // Live diagnostics sidebar text (Hologram look)
    ctx.font = '7px "Courier New", monospace';
    ctx.fillStyle = statusColor;
    const statsYStart = ctx.canvas.height - 65;
    ctx.fillText(`SYS.RECON: ACTIVE`, ctx.canvas.width - 100, statsYStart);
    ctx.fillText(`CALIB: ${(98 + Math.sin(Date.now() / 1000) * 1.5).toFixed(1)}%`, ctx.canvas.width - 100, statsYStart + 10);
    ctx.fillText(`FPS: 30.0`, ctx.canvas.width - 100, statsYStart + 20);
    ctx.fillText(`LOCK: NOMINAL`, ctx.canvas.width - 100, statsYStart + 30);
}

// Draw angle helper
function drawAngleIndicator(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    idxA: number,
    idxB: number,
    idxC: number,
    label: string,
    statusColor: string
) {
    const lmA = landmarks[idxA];
    const lmB = landmarks[idxB];
    const lmC = landmarks[idxC];
    if (lmA && lmB && lmC && lmA.visibility > 0.5 && lmB.visibility > 0.5 && lmC.visibility > 0.5) {
        const xA = lmA.x * ctx.canvas.width;
        const yA = lmA.y * ctx.canvas.height;
        const xB = lmB.x * ctx.canvas.width;
        const yB = lmB.y * ctx.canvas.height;
        const xC = lmC.x * ctx.canvas.width;
        const yC = lmC.y * ctx.canvas.height;

        // Calc angle
        const angle = calcAngle(lmA, lmB, lmC);

        // Draw arc
        const r = 20;
        const startAngle = Math.atan2(yA - yB, xA - xB);
        const endAngle = Math.atan2(yC - yB, xC - xB);
        ctx.beginPath();
        ctx.arc(xB, yB, r, startAngle, endAngle);
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Draw text near joint
        const textX = xB + 18;
        const textY = yB - 12;
        ctx.font = '8px "Courier New", monospace';
        ctx.fillStyle = '#FFFFFF';
        
        // Solid black background box for legibility
        const txt = `${label}:${Math.round(angle)}°`;
        const txtWidth = ctx.measureText(txt).width;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(textX - 2, textY - 8, txtWidth + 4, 11);
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(textX - 2, textY - 8, txtWidth + 4, 11);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(txt, textX, textY);
    }
}

// Exercise Form Validators using Dual Arms & Alignment
const EXERCISES: Record<string, ExerciseConfig> = {
    'Bench Press': {
        name: 'Bench Press',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Ensure your arms are in frame'], reps: 0 };

            const tips: string[] = [];
            let score = 100;

            // Strict Pose check: should not be standing upright with arms hanging down
            const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_HIP);
            const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_HIP);
            const isVertical = isVisible(lm, LM.LEFT_SHOULDER) && isVisible(lm, LM.LEFT_HIP) && lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y;
            
            const leftWristAtSide = leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_SHOULDER].y + 0.1;
            const rightWristAtSide = rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_SHOULDER].y + 0.1;

            let wristsAboveHips = true;
            if (leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_HIP].y) wristsAboveHips = false;
            if (rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_HIP].y) wristsAboveHips = false;

            if (isVertical && (leftWristAtSide || rightWristAtSide)) {
                tips.push('Position yourself on the bench. Lift arms.');
                score = 30;
            } else if (!wristsAboveHips) {
                tips.push('Keep weights above your hips.');
                score = 30;
            } else {
                const shoulderAlign = checkAlignment(lm, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER);
                if (shoulderAlign !== null && shoulderAlign > 0.2) {
                    tips.push('Shoulders unaligned. Keep your back flat.');
                    score -= 20;
                }

                if (angle < 70) { tips.push('Elbows bending well! Push up smoothly.'); }
                else if (angle < 90) { tips.push('Lower the bar more into a deeper stretch.'); score -= 15; }
                if (angle > 160) { tips.push('Great extension! Lock out at the top.'); }
            }

            if (tips.length === 0) tips.push('Form looks great! Keep it symmetric. 💪');
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Shoulder Press': {
        name: 'Shoulder Press',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Stand facing the camera'], reps: 0 };

            const tips: string[] = [];
            let score = 100;

            // Strict Pose check: standing upright, and hands must be above hip level
            const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_HIP);
            const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_HIP);
            
            let wristsAboveHips = true;
            if (leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_HIP].y) wristsAboveHips = false;
            if (rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_HIP].y) wristsAboveHips = false;

            if (!isVertical || !wristsAboveHips) {
                tips.push('Stand upright. Keep hands above hip level.');
                score = 30;
            } else {
                const shoulderAlign = checkAlignment(lm, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER);
                if (shoulderAlign !== null && shoulderAlign > 0.15) {
                    tips.push('Posture uneven. Keep shoulders level.');
                    score -= 10;
                }

                if (angle < 80 && angle > 20) { tips.push('Good lowering phase — controlled descent!'); }
                if (angle > 160) { tips.push('Arms extended! Great press.'); }
            }

            if (tips.length === 0) tips.push('Perfect shoulder press form! ✅');
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Tricep Dips': {
        name: 'Tricep Dips',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Face the camera sideways for best results'], reps: 0 };

            const tips: string[] = [];
            let score = 100;

            const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            if (!isVertical) {
                tips.push('Keep your torso upright for dips.');
                score = 30;
            } else {
                if (angle > 120) { tips.push('Dip lower — aim for a 90° elbow bend.'); score -= 30; }
                if (angle < 50) { tips.push('Full extension at the top for tricep activation.'); score -= 10; }
            }

            if (tips.length === 0) tips.push('Excellent dip depth! 🔥');
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Pull-Ups': {
        name: 'Pull-Ups',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Make sure your upper body is visible'], reps: 0 };
            const tips: string[] = [];
            let score = 100;

            // Strict Pose Check (Wrists must be above shoulders and body vertical)
            const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_SHOULDER);
            const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_SHOULDER);

            const leftWristVal = leftWristVisible && lm[LM.LEFT_WRIST].y < lm[LM.LEFT_SHOULDER].y - 0.05;
            const rightWristVal = rightWristVisible && lm[LM.RIGHT_WRIST].y < lm[LM.RIGHT_SHOULDER].y - 0.05;

            let wristsAboveShoulders = false;
            if (leftWristVisible && rightWristVisible) {
                wristsAboveShoulders = leftWristVal && rightWristVal;
            } else if (leftWristVisible) {
                wristsAboveShoulders = leftWristVal;
            } else if (rightWristVisible) {
                wristsAboveShoulders = rightWristVal;
            }

            const leftHipVisible = isVisible(lm, LM.LEFT_HIP) && isVisible(lm, LM.LEFT_SHOULDER);
            const rightHipVisible = isVisible(lm, LM.RIGHT_HIP) && isVisible(lm, LM.RIGHT_SHOULDER);
            let isVertical = false;

            if (leftHipVisible && rightHipVisible) {
                isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            } else if (leftHipVisible) {
                isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y;
            } else if (rightHipVisible) {
                isVertical = lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            } else {
                isVertical = isVisible(lm, LM.NOSE) && isVisible(lm, LM.LEFT_SHOULDER) && lm[LM.NOSE].y < lm[LM.LEFT_SHOULDER].y;
            }

            if (!wristsAboveShoulders || !isVertical) {
                tips.push('Wrists must be above shoulders. Do not perform pushups in pullup mode.');
                score = 30;
            } else {
                if (angle > 150) { tips.push('Pull higher! Bring your chin above the bar.'); score -= 25; }
                if (angle < 60) { tips.push('Great height! Control the lowering phase.'); }
            }

            return {
                score: Math.max(score, 30),
                status: score > 75 ? 'good' : 'warn',
                tips: tips.length > 0 ? tips : ['Strong pull-up form! 🦾'],
                reps: 0
            };
        },
    },
    'Incline DB Press': {
        name: 'Incline DB Press',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Position yourself for Incline Press'], reps: 0 };
            const tips: string[] = [];
            let score = 100;

            const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_HIP);
            const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_HIP);
            
            let wristsAboveHips = true;
            if (leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_HIP].y) wristsAboveHips = false;
            if (rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_HIP].y) wristsAboveHips = false;

            // Should not be standing upright with arms hanging straight down
            const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            const leftWristAtSide = leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_SHOULDER].y + 0.1;
            const rightWristAtSide = rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_SHOULDER].y + 0.1;

            if (isVertical && (leftWristAtSide || rightWristAtSide)) {
                tips.push('Position yourself on the bench. Lift arms.');
                score = 30;
            } else if (!wristsAboveHips) {
                tips.push('Keep weights above your hips.');
                score = 30;
            } else {
                if (angle < 60) { tips.push('Lower DBs precisely to upper chest level.'); }
                if (angle > 160) { tips.push('Great squeeze at the top!'); }
            }

            if (tips.length === 0) tips.push('Solid incline form! 📈');
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Cable Flyes': {
        name: 'Cable Flyes',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Stand facing the camera with arms wide'], reps: 0 };
            const tips: string[] = [];
            let score = 100;

            const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            const leftElbowVisible = isVisible(lm, LM.LEFT_ELBOW) && isVisible(lm, LM.LEFT_SHOULDER);
            const rightElbowVisible = isVisible(lm, LM.RIGHT_ELBOW) && isVisible(lm, LM.RIGHT_SHOULDER);

            let elbowsRaised = true;
            if (leftElbowVisible && lm[LM.LEFT_ELBOW].y > lm[LM.LEFT_SHOULDER].y + 0.15) elbowsRaised = false;
            if (rightElbowVisible && lm[LM.RIGHT_ELBOW].y > lm[LM.RIGHT_SHOULDER].y + 0.15) elbowsRaised = false;

            if (!isVertical || !elbowsRaised) {
                tips.push('Stand upright. Raise elbows to chest level.');
                score = 30;
            } else {
                if (angle < 120) { tips.push('Keep a slight bend in elbows, don\'t press!'); score -= 30; }
                if (angle > 175) { tips.push('Don\'t lock out elbows completely.'); score -= 15; }
            }

            if (tips.length === 0) tips.push('Great chest squeeze! 🦋');
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Bicep Curls': {
        name: 'Bicep Curls',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Make sure your arms are visible'], reps: 0 };
            const tips: string[] = [];
            let score = 100;

            const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            const leftElbowVisible = isVisible(lm, LM.LEFT_ELBOW) && isVisible(lm, LM.LEFT_SHOULDER);
            const rightElbowVisible = isVisible(lm, LM.RIGHT_ELBOW) && isVisible(lm, LM.RIGHT_SHOULDER);
            
            let elbowsAtSides = true;
            if (leftElbowVisible && lm[LM.LEFT_ELBOW].y < lm[LM.LEFT_SHOULDER].y + 0.05) elbowsAtSides = false;
            if (rightElbowVisible && lm[LM.RIGHT_ELBOW].y < lm[LM.RIGHT_SHOULDER].y + 0.05) elbowsAtSides = false;

            if (!isVertical || !elbowsAtSides) {
                tips.push('Stand upright. Keep elbows locked at your sides.');
                score = 30;
            } else {
                const elbowAlign = checkAlignment(lm, LM.LEFT_ELBOW, LM.LEFT_HIP) || checkAlignment(lm, LM.RIGHT_ELBOW, LM.RIGHT_HIP) || 0;
                if (elbowAlign > 0.25) {
                    tips.push('Keep elbows locked tight to your sides.');
                    score -= 15;
                }

                if (angle > 150) { tips.push('Good full extension! Now curl up.'); }
                else if (angle < 50) { tips.push('Great contraction! Squeeze the biceps.'); }
                else { tips.push('Avoid swinging. Core tight.'); }
            }

            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Lateral Raises': {
        name: 'Lateral Raises',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW], [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Ensure your upper body is in frame'], reps: 0 };
            const tips: string[] = [];
            let score = 100;

            const shoulderAlign = checkAlignment(lm, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER);
            if (shoulderAlign !== null && shoulderAlign > 0.15) {
                tips.push('Don\'t shrug one shoulder. Keep them down.');
                score -= 10;
            }

            if (angle > 105) { tips.push('Too high! Stop at shoulder level.'); score -= 25; }
            else if (angle > 75 && angle <= 100) { tips.push('Perfect height! Control the descent.'); }
            else { tips.push('Lead with the elbows! 🦅'); }

            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Plate Hammer Curls': {
        name: 'Plate Hammer Curls',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Make sure your arms are visible'], reps: 0 };
            const tips: string[] = [];
            let score = 100;

            const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
            const leftElbowVisible = isVisible(lm, LM.LEFT_ELBOW) && isVisible(lm, LM.LEFT_SHOULDER);
            const rightElbowVisible = isVisible(lm, LM.RIGHT_ELBOW) && isVisible(lm, LM.RIGHT_SHOULDER);
            
            let elbowsAtSides = true;
            if (leftElbowVisible && lm[LM.LEFT_ELBOW].y < lm[LM.LEFT_SHOULDER].y + 0.05) elbowsAtSides = false;
            if (rightElbowVisible && lm[LM.RIGHT_ELBOW].y < lm[LM.RIGHT_SHOULDER].y + 0.05) elbowsAtSides = false;

            if (!isVertical || !elbowsAtSides) {
                tips.push('Stand upright. Keep elbows locked at your sides.');
                score = 30;
            } else {
                if (angle > 140) { tips.push('Lower the plate with control.'); }
                else if (angle < 60) { tips.push('Nice squeeze on the forearms at the top!'); }
                else { tips.push('Maintain neutral grip. 🔨'); }
            }

            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Squats': {
        name: 'Squats',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE], [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Step back to show your entire body'], reps: 0 };
            
            const tips: string[] = [];
            let score = 100;
            if (angle > 140) {
                tips.push('Squat deeper — lower hips until thighs are parallel.');
                score -= 30;
            } else if (angle < 70) {
                tips.push('Too deep! Avoid squatting past 70° to protect knees.');
                score -= 15;
            } else {
                tips.push('Excellent squat depth! Drive up through heels.');
            }
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        },
    },
    'Pushups': {
        name: 'Pushups',
        analyzeAngles: (lm) => {
            const angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
            if (!angle) return { score: 0, status: 'idle', tips: ['Position yourself sideways to the camera'], reps: 0 };
            
            const tips: string[] = [];
            let score = 100;
            
            // Check if body is straight (shoulder-hip-knee angle should be close to 180 degrees)
            const hipAngle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], [LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE]);
            if (hipAngle !== null && (hipAngle < 155 || hipAngle > 195)) {
                tips.push('Keep your body straight. Do not sag or raise your hips.');
                score -= 25;
            }
            
            if (angle > 120) {
                tips.push('Lower your chest closer to the ground.');
                score -= 20;
            } else if (angle < 65) {
                tips.push('Good depth! Now push back up.');
            } else {
                tips.push('Excellent pushup form. Keep your core tight.');
            }
            return { score: Math.max(score, 30), status: score > 75 ? 'good' : 'warn', tips, reps: 0 };
        }
    }
};

interface PoseCheckerProps {
    exerciseName: string;
    onClose: () => void;
}

const PoseChecker: React.FC<PoseCheckerProps> = ({ exerciseName, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const poseRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const repStateRef = useRef<'up' | 'down'>('up');
    const repCountRef = useRef(0);

    const [feedback, setFeedback] = useState<PoseFeedback>({
        score: 0,
        status: 'idle',
        tips: ['Initializing Vision Feed...'],
        reps: 0,
    });
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sysLogs, setSysLogs] = useState<string[]>([
        "SYSTEM STABILIZATION INITIALIZED",
        "RECON ENGINE ACTIVE",
        "BIOMETRIC DATA LOCK: ENGAGED"
    ]);

    // Friday Voice Agent and Custom AI Trainer states
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isTrainingMode, setIsTrainingMode] = useState(false);
    const [customActivityName, setCustomActivityName] = useState(exerciseName);
    const [correctPoseVector, setCorrectPoseVector] = useState<number[] | null>(null);
    const [incorrectPoseVector, setIncorrectPoseVector] = useState<number[] | null>(null);
    const [isCleanScreen, setIsCleanScreen] = useState(false);

    const lastSpokenRef = useRef<string>('');
    const lastSpokenTimeRef = useRef<number>(0);
    const prevStatusRef = useRef<'good' | 'warn' | 'idle'>('idle');
    const isTrainingModeRef = useRef<boolean>(false);
    const correctPoseVectorRef = useRef<number[] | null>(null);
    const incorrectPoseVectorRef = useRef<number[] | null>(null);
    const poseLandmarksRef = useRef<any>(null);
    const voiceEnabledRef = useRef<boolean>(true);

    const exerciseConfig = EXERCISES[exerciseName] || EXERCISES['Bench Press'];

    // Load custom templates for the selected exercise from localStorage when component mounts or exerciseName changes
    useEffect(() => {
        const savedCorrect = localStorage.getItem(`FITGURU_AI_CORRECT_${exerciseName}`);
        const savedIncorrect = localStorage.getItem(`FITGURU_AI_INCORRECT_${exerciseName}`);
        if (savedCorrect) {
            setCorrectPoseVector(JSON.parse(savedCorrect));
        } else {
            setCorrectPoseVector(null);
        }
        if (savedIncorrect) {
            setIncorrectPoseVector(JSON.parse(savedIncorrect));
        } else {
            setIncorrectPoseVector(null);
        }
        // Reset rep counts when exercise changes
        repCountRef.current = 0;
        repStateRef.current = 'up';
        setCustomActivityName(exerciseName);
    }, [exerciseName]);

    // Sync state to refs for use in callbacks
    useEffect(() => {
        isTrainingModeRef.current = isTrainingMode;
    }, [isTrainingMode]);

    useEffect(() => {
        correctPoseVectorRef.current = correctPoseVector;
    }, [correctPoseVector]);

    useEffect(() => {
        incorrectPoseVectorRef.current = incorrectPoseVector;
    }, [incorrectPoseVector]);

    useEffect(() => {
        voiceEnabledRef.current = voiceEnabled;
    }, [voiceEnabled]);

    // Load voices
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    const speakFeedback = useCallback((text: string, force = false) => {
        if (!('speechSynthesis' in window) || !voiceEnabledRef.current) return;
        
        const now = Date.now();
        if (force || (text !== lastSpokenRef.current && now - lastSpokenTimeRef.current > 5000)) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => 
                v.name.includes("Google US English") || 
                v.name.includes("Samantha") || 
                v.name.includes("Zira") || 
                v.name.includes("Tessa") ||
                v.name.includes("Victoria") || 
                v.name.includes("Female")
            );
            if (femaleVoice) utterance.voice = femaleVoice;
            utterance.rate = 1.05;
            utterance.pitch = 1.15;
            window.speechSynthesis.speak(utterance);
            lastSpokenRef.current = text;
            lastSpokenTimeRef.current = now;
        }
    }, []);

    // Rolling diagnostics log interval
    useEffect(() => {
        const interval = setInterval(() => {
            const logTemplates = [
                "CALIBRATING ROTATIONAL DYNAMICS...",
                "SCANNING SKELETAL SYMMETRY...",
                "COMPUTING FORCE VECTOR MATRICES...",
                "GRID RESOLUTION OPTIMAL [60FPS]",
                "ANGLE RECOGNITION LOCK CONFIRMED",
                "BIOMETRICS NORMAL // SIGNAL NOMINAL",
                "CALIBRATION OFFSET: 0.04 DEG",
                "HEURISTICS ANALYZING DEXTERITY...",
                "SYS_LOG: REPS COUNTING REGISTERED",
                "JARVIS ENGINE RUNNING AT 99.8% STABLE",
                "SYNCHRONIZING GRAVITATIONAL COMPENSATION...",
                "HOLOGRAPHIC FOCUS: LOCK ACQUIRED"
            ];
            const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
            const timestamp = new Date().toLocaleTimeString().split(' ')[0];
            setSysLogs(prev => [...prev.slice(-3), `[${timestamp}] ${randomTemplate}`]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Trigger Friday greeting when camera ready
    useEffect(() => {
        if (cameraReady) {
            speakFeedback(`Friday systems online. Loaded guide for ${exerciseName}. Ready for calibration.`, true);
        }
    }, [cameraReady, speakFeedback, exerciseName]);

    const onResults = useCallback(
        (results: any) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx || !results.image) return;

            canvas.width = results.image.width;
            canvas.height = results.image.height;

            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            if (results.poseLandmarks) {
                poseLandmarksRef.current = results.poseLandmarks;

                let fb: PoseFeedback = { score: 0, status: 'idle', tips: [], reps: repCountRef.current };

                // Process Pose based on mode (Pre-trained Heuristics vs. Custom AI)
                if (isTrainingModeRef.current) {
                    const liveVector = getPoseAngleVector(results.poseLandmarks);
                    if (correctPoseVectorRef.current) {
                        const diffCorrect = calculateVectorDifference(correctPoseVectorRef.current, liveVector);
                        let score = Math.max(0, Math.round(100 - diffCorrect * 2.2));
                        let status: 'good' | 'warn' | 'idle' = score > 75 ? 'good' : 'warn';
                        let tips: string[] = [];

                        if (incorrectPoseVectorRef.current) {
                            const diffIncorrect = calculateVectorDifference(incorrectPoseVectorRef.current, liveVector);
                            if (diffIncorrect < diffCorrect) {
                                tips = ["AI Warning: Form matches trained incorrect posture!"];
                                score = Math.min(score, 45);
                                status = 'warn';
                            } else {
                                tips = [`AI Model: Form matches correct template by ${score}%`];
                            }
                        } else {
                            tips = [`AI Model: Form matches correct template by ${score}%`];
                        }

                        fb = { score, status, tips, reps: repCountRef.current };

                        // Custom AI Rep counting logic
                        if (score > 80 && repStateRef.current === 'down') {
                            repStateRef.current = 'up';
                            repCountRef.current += 1;
                        }
                        if (score < 50 && repStateRef.current === 'up') {
                            repStateRef.current = 'down';
                        }
                        fb.reps = repCountRef.current;
                    } else {
                        fb = {
                            score: 0,
                            status: 'idle',
                            tips: ["Custom AI Mode. Capture 'Good Pose' to start training."],
                            reps: repCountRef.current
                        };
                    }
                } else {
                    fb = exerciseConfig.analyzeAngles(results.poseLandmarks);

                    const lm = results.poseLandmarks;
                    let angle = null;
                    let stanceValid = true;

                    if (exerciseName === 'Lateral Raises') {
                        // Check if vertical stance
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        if (!isVertical) {
                            stanceValid = false;
                            fb.tips = ["Stand upright for Lateral Raises."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Stand upright for lateral raises.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW], [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW]);
                            if (angle !== null) {
                                if (angle > 70 && repStateRef.current === 'down') repStateRef.current = 'up';
                                if (angle < 30 && repStateRef.current === 'up') {
                                    repStateRef.current = 'down';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Squats') {
                        // Check if vertical stance (shoulders well above hips)
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        if (!isVertical) {
                            stanceValid = false;
                            fb.tips = ["Keep your body vertical for Squats."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Keep your body vertical for squats.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE], [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE]);
                            if (angle !== null) {
                                if (angle < 100 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 155 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Pushups') {
                        // Check if horizontal stance (hip and shoulder Y are close, and wrists are below shoulders)
                        const isHorizontal = Math.abs(lm[LM.LEFT_SHOULDER].y - lm[LM.LEFT_HIP].y) < 0.35;
                        const wristsBelowShoulders = lm[LM.LEFT_WRIST].y > lm[LM.LEFT_SHOULDER].y;
                        if (!isHorizontal || !wristsBelowShoulders) {
                            stanceValid = false;
                            fb.tips = ["Position body horizontally and hands on the floor."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Position your body horizontally for pushups.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 90 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 140 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Pull-Ups') {
                        // Check if wrists are above shoulders and body vertical
                        const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_SHOULDER);
                        const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_SHOULDER);

                        const leftWristVal = leftWristVisible && lm[LM.LEFT_WRIST].y < lm[LM.LEFT_SHOULDER].y - 0.05;
                        const rightWristVal = rightWristVisible && lm[LM.RIGHT_WRIST].y < lm[LM.RIGHT_SHOULDER].y - 0.05;

                        let wristsAboveShoulders = false;
                        if (leftWristVisible && rightWristVisible) {
                            wristsAboveShoulders = leftWristVal && rightWristVal;
                        } else if (leftWristVisible) {
                            wristsAboveShoulders = leftWristVal;
                        } else if (rightWristVisible) {
                            wristsAboveShoulders = rightWristVal;
                        }

                        const leftHipVisible = isVisible(lm, LM.LEFT_HIP) && isVisible(lm, LM.LEFT_SHOULDER);
                        const rightHipVisible = isVisible(lm, LM.RIGHT_HIP) && isVisible(lm, LM.RIGHT_SHOULDER);
                        let isVertical = false;

                        if (leftHipVisible && rightHipVisible) {
                            isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        } else if (leftHipVisible) {
                            isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y;
                        } else if (rightHipVisible) {
                            isVertical = lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        } else {
                            isVertical = isVisible(lm, LM.NOSE) && isVisible(lm, LM.LEFT_SHOULDER) && lm[LM.NOSE].y < lm[LM.LEFT_SHOULDER].y;
                        }

                        if (!wristsAboveShoulders || !isVertical) {
                            stanceValid = false;
                            fb.tips = ["Raise wrists above shoulders. Hang vertically."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Wrists must be above shoulders. Are you doing pushups instead of a pullup?");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 90 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 140 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Shoulder Press') {
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_HIP);
                        const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_HIP);
                        
                        let wristsAboveHips = true;
                        if (leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_HIP].y) wristsAboveHips = false;
                        if (rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_HIP].y) wristsAboveHips = false;

                        if (!isVertical || !wristsAboveHips) {
                            stanceValid = false;
                            fb.tips = ["Stand upright. Keep hands above hip level."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Keep hands raised for shoulder press.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 80 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 150 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Bench Press' || exerciseName === 'Incline DB Press') {
                        const leftWristVisible = isVisible(lm, LM.LEFT_WRIST) && isVisible(lm, LM.LEFT_HIP);
                        const rightWristVisible = isVisible(lm, LM.RIGHT_WRIST) && isVisible(lm, LM.RIGHT_HIP);
                        
                        let wristsAboveHips = true;
                        if (leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_HIP].y) wristsAboveHips = false;
                        if (rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_HIP].y) wristsAboveHips = false;

                        // Should not be standing upright with arms hanging straight down
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        const leftWristAtSide = leftWristVisible && lm[LM.LEFT_WRIST].y > lm[LM.LEFT_SHOULDER].y + 0.1;
                        const rightWristAtSide = rightWristVisible && lm[LM.RIGHT_WRIST].y > lm[LM.RIGHT_SHOULDER].y + 0.1;
                        
                        if (isVertical && (leftWristAtSide || rightWristAtSide)) {
                            stanceValid = false;
                            fb.tips = ["Position yourself on the bench. Lift arms."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Position yourself on the bench for pressing.");
                        } else if (!wristsAboveHips) {
                            stanceValid = false;
                            fb.tips = ["Keep weights above your hips."];
                            fb.status = 'warn';
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 80 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 150 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Bicep Curls' || exerciseName === 'Plate Hammer Curls') {
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        const leftElbowVisible = isVisible(lm, LM.LEFT_ELBOW) && isVisible(lm, LM.LEFT_SHOULDER);
                        const rightElbowVisible = isVisible(lm, LM.RIGHT_ELBOW) && isVisible(lm, LM.RIGHT_SHOULDER);
                        
                        let elbowsAtSides = true;
                        if (leftElbowVisible && lm[LM.LEFT_ELBOW].y < lm[LM.LEFT_SHOULDER].y + 0.05) elbowsAtSides = false;
                        if (rightElbowVisible && lm[LM.RIGHT_ELBOW].y < lm[LM.RIGHT_SHOULDER].y + 0.05) elbowsAtSides = false;

                        if (!isVertical || !elbowsAtSides) {
                            stanceValid = false;
                            fb.tips = ["Stand upright. Keep elbows locked at your sides."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Keep elbows at your sides for curls.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 70 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 140 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Cable Flyes') {
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        const leftElbowVisible = isVisible(lm, LM.LEFT_ELBOW) && isVisible(lm, LM.LEFT_SHOULDER);
                        const rightElbowVisible = isVisible(lm, LM.RIGHT_ELBOW) && isVisible(lm, LM.RIGHT_SHOULDER);

                        let elbowsRaised = true;
                        if (leftElbowVisible && lm[LM.LEFT_ELBOW].y > lm[LM.LEFT_SHOULDER].y + 0.15) elbowsRaised = false;
                        if (rightElbowVisible && lm[LM.RIGHT_ELBOW].y > lm[LM.RIGHT_SHOULDER].y + 0.15) elbowsRaised = false;

                        if (!isVertical || !elbowsRaised) {
                            stanceValid = false;
                            fb.tips = ["Stand upright. Raise elbows to chest level."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Keep your elbows raised for flyes.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 120 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 165 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else if (exerciseName === 'Tricep Dips') {
                        const isVertical = lm[LM.LEFT_SHOULDER].y < lm[LM.LEFT_HIP].y && lm[LM.RIGHT_SHOULDER].y < lm[LM.RIGHT_HIP].y;
                        if (!isVertical) {
                            stanceValid = false;
                            fb.tips = ["Keep your torso upright for dips."];
                            fb.status = 'warn';
                            speakFeedback("Warning: Keep your body vertical for dips.");
                        } else {
                            angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                            if (angle !== null) {
                                if (angle < 90 && repStateRef.current === 'up') repStateRef.current = 'down';
                                if (angle > 145 && repStateRef.current === 'down') {
                                    repStateRef.current = 'up';
                                    repCountRef.current += 1;
                                }
                            }
                        }
                    } else {
                        angle = getBestAngle(lm, [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST], [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST]);
                        if (angle !== null) {
                            if (angle < 90 && repStateRef.current === 'up') repStateRef.current = 'down';
                            if (angle > 140 && repStateRef.current === 'down') {
                                repStateRef.current = 'up';
                                repCountRef.current += 1;
                            }
                        }
                    }

                    if (!stanceValid) {
                        fb.score = Math.min(fb.score, 30);
                        repStateRef.current = 'up'; // Reset state to prevent cross-frame noise counting reps
                    }
                    fb.reps = repCountRef.current;
                }

                const statusColor = fb.score > 80 ? '#00ff55' : fb.score > 50 ? '#FF9100' : '#FF1744';

                if (typeof POSE_CONNECTIONS !== 'undefined') {
                    drawIronManHUD(ctx, results.poseLandmarks, POSE_CONNECTIONS, isTrainingModeRef.current ? "Custom AI Trainer" : exerciseName, statusColor);
                }

                // Scanning Overlay Effect (JARVIS style)
                const time = Date.now() / 1500;
                const scanY = (Math.sin(time * Math.PI) * 0.5 + 0.5) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, scanY);
                ctx.lineTo(canvas.width, scanY);
                ctx.strokeStyle = statusColor;
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 10;
                ctx.shadowColor = statusColor;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Speech feedback trigger
                if (fb.status === 'warn' && fb.tips.length > 0) {
                    speakFeedback(fb.tips[0]);
                } else if (fb.status === 'good' && prevStatusRef.current === 'warn') {
                    speakFeedback("Form corrected. Perfect.");
                }
                prevStatusRef.current = fb.status;

                setFeedback(fb);
                setCameraReady(true);
            }
        },
        [exerciseConfig, exerciseName, speakFeedback]
    );

    useEffect(() => {
        let mounted = true;

        const initPose = async () => {
            try {
                if (typeof Pose === 'undefined') {
                    setError('Vision Framework Offline. Attempting reconnect...');
                    return;
                }

                const pose = new Pose({
                    locateFile: (file: string) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
                });

                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    smoothSegmentation: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                pose.onResults(onResults);
                poseRef.current = pose;

                if (videoRef.current) {
                    const cam = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (poseRef.current && videoRef.current) {
                                await poseRef.current.send({ image: videoRef.current });
                            }
                        },
                        width: 640,
                        height: 480,
                    });
                    cameraRef.current = cam;
                    await cam.start();
                    if (mounted) setCameraReady(true);
                }
            } catch (err: any) {
                if (mounted) setError(err.message || 'Vision sensor denied. Allow camera feed.');
            }
        };

        initPose();

        return () => {
            mounted = false;
            if (cameraRef.current) cameraRef.current.stop();
            if (poseRef.current) poseRef.current.close();
        };
    }, [onResults]);

    const scoreColor = feedback.score > 80 ? '#00ff55' : feedback.score > 50 ? '#FF9100' : '#FF1744';

    return (
        <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-0 z-[70] bg-[#050505] flex flex-col overflow-hidden font-mono animate-fade-in"
        >
            <div className="absolute inset-0 bg-transparent pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 85, 0.03) 0%, transparent 60%)' }} />

            <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0 relative z-10 border-b border-[#00ff55]/20 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    {/* Spinning Holographic Arc Reactor */}
                    <svg className="w-9 h-9 animate-spin text-[#00ff55] drop-shadow-[0_0_8px_#00ff55]" style={{ animationDuration: '10s' }} viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="30 10" />
                        <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.8" />
                        <line x1="50" y1="5" x2="50" y2="25" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="50" y1="95" x2="50" y2="75" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="5" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="95" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#00ff55]/60 font-semibold font-mono">T.A.R.G.E.T. Lock // JARVIS_V4</p>
                        <h2 className="font-heading text-3xl text-white tracking-wide uppercase">{isTrainingMode ? `AI: ${customActivityName}` : exerciseName}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCleanScreen(!isCleanScreen)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] rounded-xl font-mono transition-all uppercase ${
                            isCleanScreen
                                ? 'border-[#00ff55] bg-[#00ff55]/25 text-[#00ff55] shadow-[0_0_10px_rgba(0,240,255,0.35)] font-bold'
                                : 'border-white/20 text-white/60 hover:bg-white/5'
                        }`}
                        title={isCleanScreen ? "Show UI Panels" : "Hide UI for Clean Video Feed"}
                    >
                        {isCleanScreen ? <Eye size={12} /> : <EyeOff size={12} />}
                        {isCleanScreen ? "Show Diagnostics" : "Clean HUD"}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 border border-[#00ff55]/30 text-[#00ff55] rounded-xl hover:bg-[#00ff55]/10 transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    >
                        <X size={22} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className={`relative flex-1 m-4 rounded-xl border overflow-hidden bg-[#0A0A0A] transition-all duration-300 ${
                feedback.status === 'warn'
                    ? 'border-orange-500/50 shadow-[inset_0_0_40px_rgba(239,68,68,0.15),0_0_30px_rgba(251,146,60,0.15)]'
                    : feedback.score < 60 && feedback.status !== 'idle'
                        ? 'border-red-500/60 shadow-[inset_0_0_50px_rgba(239,68,68,0.3),0_0_40px_rgba(239,68,68,0.2)] animate-pulse'
                        : 'border-[#00ff55]/30 shadow-[inset_0_0_40px_rgba(0,240,255,0.05)]'
            }`}>
                <video ref={videoRef} className="hidden" playsInline muted />
                
                {/* Clean Camera View Container: uses object-contain to avoid cropping posture */}
                <canvas ref={canvasRef} className="w-full h-full object-contain" />

                {/* CRT Scanline and Hologram grid effect */}
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                
                {/* Hologram static layer */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-repeat bg-center" style={{ backgroundImage: 'radial-gradient(circle, #00ff55 10%, transparent 11%)', backgroundSize: '12px 12px' }} />

                {!cameraReady && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm z-20">
                        <div className="w-16 h-16 rounded-full border border-[#00ff55]/40 border-t-[#00ff55] animate-spin shadow-[0_0_15px_#00ff55]" />
                        <p className="text-[#00ff55] text-sm uppercase tracking-[0.2em] animate-pulse">Initializing Vision Feed...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center bg-black/80 backdrop-blur-sm z-20">
                        <CameraOff size={48} className="text-red-500 shadow-[0_0_20px_#FF1744] rounded-full" />
                        <p className="text-red-400 text-sm font-mono tracking-widest uppercase">{error}</p>
                    </div>
                )}

                {/* Left Telemetry Box (Cycles): Hidden if Clean Screen toggled */}
                {cameraReady && !isCleanScreen && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-5 py-3 border border-[#00ff55]/30 flex flex-col items-start gap-0.5 shadow-[0_0_15px_rgba(0,240,255,0.15)] animate-fade-in">
                        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#00ff55]/50 font-mono">RECON.CYCLES</span>
                        <span className="font-heading text-4xl text-[#00ff55] drop-shadow-[0_0_8px_#00ff55]">{feedback.reps}</span>
                        <div className="w-10 h-0.5 bg-[#00ff55]/40 mt-1"></div>
                    </div>
                )}

                {/* Right Telemetry Box (Integrity): Hidden if Clean Screen toggled */}
                {cameraReady && !isCleanScreen && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg px-5 py-3 border border-[#00ff55]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] min-w-[110px] animate-fade-in">
                        <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#00ff55]/50 font-mono text-right">SYS.INTEGRITY</p>
                        <p className="font-heading text-4xl text-right" style={{ color: scoreColor, textShadow: `0 0 8px ${scoreColor}` }}>
                            {feedback.score}%
                        </p>
                        <div className="flex justify-end gap-0.5 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-sm`} style={{ backgroundColor: feedback.score >= 30 ? scoreColor : 'transparent', border: feedback.score < 30 ? `1px solid ${scoreColor}50` : 'none' }}></span>
                            <span className={`w-1.5 h-1.5 rounded-sm`} style={{ backgroundColor: feedback.score >= 60 ? scoreColor : 'transparent', border: feedback.score < 60 ? `1px solid ${scoreColor}50` : 'none' }}></span>
                            <span className={`w-1.5 h-1.5 rounded-sm`} style={{ backgroundColor: feedback.score >= 80 ? scoreColor : 'transparent', border: feedback.score < 80 ? `1px solid ${scoreColor}50` : 'none' }}></span>
                        </div>
                    </div>
                )}

                {/* Floating Holographic Control Panel: Hidden if Clean Screen toggled */}
                {cameraReady && !isCleanScreen && (
                    <div className="absolute top-24 right-4 bg-black/70 backdrop-blur-md rounded-xl p-4 w-60 border border-[#00ff55]/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col gap-3 z-30 text-white animate-fade-in">
                        <div className="flex items-center justify-between border-b border-[#00ff55]/20 pb-2">
                            <span className="text-[10px] font-bold tracking-widest text-[#00ff55] uppercase flex items-center gap-1.5 font-mono">
                                <Cpu size={12} className="animate-pulse text-[#00ff55]" /> COGNITIVE CORE
                            </span>
                            <button
                                onClick={() => {
                                    setVoiceEnabled(!voiceEnabled);
                                    speakFeedback(voiceEnabled ? "Friday audio streams offline." : "Friday voice feedback active.", true);
                                }}
                                className={`p-1.5 rounded-lg border transition-all ${
                                    voiceEnabled
                                        ? 'border-[#00ff55]/40 bg-[#00ff55]/10 text-[#00ff55] shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                                        : 'border-white/10 text-white/40 hover:bg-white/5'
                                }`}
                                title={voiceEnabled ? "Mute Friday Voice Agent" : "Unmute Friday Voice Agent"}
                            >
                                {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                            </button>
                        </div>

                        {/* Mode Selector */}
                        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setIsTrainingMode(false)}
                                className={`flex-1 text-[9px] py-1.5 px-1 rounded-md font-bold uppercase transition-all font-mono ${
                                    !isTrainingMode
                                        ? 'bg-[#00ff55]/25 text-[#00ff55] border border-[#00ff55]/30'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                PRE-TRAINED
                            </button>
                            <button
                                onClick={() => setIsTrainingMode(true)}
                                className={`flex-1 text-[9px] py-1.5 px-1 rounded-md font-bold uppercase transition-all font-mono ${
                                    isTrainingMode
                                        ? 'bg-[#00ff55]/25 text-[#00ff55] border border-[#00ff55]/30'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                CUSTOM AI
                            </button>
                        </div>

                        {/* Mode Content */}
                        {!isTrainingMode ? (
                            <div className="text-[10px] text-white/60 space-y-1.5 font-mono">
                                <p className="text-[8px] uppercase tracking-wider text-[#00ff55]/60 font-semibold">// CLASSIFIER_ACTIVE</p>
                                <p className="leading-tight">Model analyzing posture using hardcoded physical constraints for {exerciseName}.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 font-mono">
                                <p className="text-[8px] uppercase tracking-wider text-[#00ff55]/60 font-bold">// AI_TRAINING_MODULE</p>
                                <input
                                    type="text"
                                    value={customActivityName}
                                    onChange={(e) => setCustomActivityName(e.target.value)}
                                    placeholder="Pose Name..."
                                    className="bg-black/60 border border-[#00ff55]/20 rounded-md px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#00ff55]/60 w-full"
                                />

                                <div className="grid grid-cols-2 gap-1.5 mt-1">
                                    <button
                                        onClick={() => {
                                            if (poseLandmarksRef.current) {
                                                const vec = getPoseAngleVector(poseLandmarksRef.current);
                                                setCorrectPoseVector(vec);
                                                localStorage.setItem(`FITGURU_AI_CORRECT_${exerciseName}`, JSON.stringify(vec));
                                                speakFeedback("Correct posture pattern locked into neural memory.", true);
                                            } else {
                                                speakFeedback("Camera not ready. Stance target missed.", true);
                                            }
                                        }}
                                        className={`text-[8px] py-2 px-1 rounded-md border font-bold uppercase transition-all flex flex-col items-center gap-0.5 ${
                                            correctPoseVector
                                                ? 'bg-green-500/20 border-green-500/40 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.15)]'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        <span>[ CAPTURE GOOD ]</span>
                                        <span className="text-[6px] text-white/40">{correctPoseVector ? 'LOCKED' : 'EMPTY'}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (poseLandmarksRef.current) {
                                                const vec = getPoseAngleVector(poseLandmarksRef.current);
                                                setIncorrectPoseVector(vec);
                                                localStorage.setItem(`FITGURU_AI_INCORRECT_${exerciseName}`, JSON.stringify(vec));
                                                speakFeedback("Incorrect posture warning vector mapped to buffer.", true);
                                            } else {
                                                speakFeedback("Camera not ready. Stance target missed.", true);
                                            }
                                        }}
                                        className={`text-[8px] py-2 px-1 rounded-md border font-bold uppercase transition-all flex flex-col items-center gap-0.5 ${
                                            incorrectPoseVector
                                                ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        <span>[ CAPTURE BAD ]</span>
                                        <span className="text-[6px] text-white/40">{incorrectPoseVector ? 'LOCKED' : 'EMPTY'}</span>
                                    </button>
                                </div>

                                {(correctPoseVector || incorrectPoseVector) && (
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem(`FITGURU_AI_CORRECT_${exerciseName}`);
                                            localStorage.removeItem(`FITGURU_AI_INCORRECT_${exerciseName}`);
                                            setCorrectPoseVector(null);
                                            setIncorrectPoseVector(null);
                                            speakFeedback("AI training core reset.", true);
                                        }}
                                        className="text-[8px] py-1.5 border border-white/10 rounded bg-white/5 text-white/50 hover:bg-white/10 hover:text-white uppercase transition-all"
                                    >
                                        Clear Model memory
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Visual Frame Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-80" style={{ borderColor: scoreColor }}></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 opacity-80" style={{ borderColor: scoreColor }}></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 opacity-80" style={{ borderColor: scoreColor }}></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-80" style={{ borderColor: scoreColor }}></div>
            </div>

            {/* Bottom HUD panels (Guidance & Logs): Hidden if Clean Screen toggled */}
            {!isCleanScreen && (
                <div className="mx-4 mb-4 bg-black/60 backdrop-blur-xl border border-[#00ff55]/20 rounded-2xl p-5 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)] animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4 md:col-span-2">
                            {feedback.status === 'good' ? (
                                <CheckCircle size={22} className="shrink-0 mt-0.5" style={{ color: scoreColor }} />
                            ) : feedback.status === 'warn' ? (
                                <AlertTriangle size={22} className="text-orange-400 shrink-0 mt-0.5 animate-pulse" />
                            ) : (
                                <Info size={22} className="text-[#00ff55]/50 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2" style={{ color: `${scoreColor}80` }}>
                                    Motion Coaching
                                    <span className="w-full h-px bg-gradient-to-r to-transparent flex-1 block" style={{ backgroundImage: `linear-gradient(to right, ${scoreColor}40, transparent)` }}></span>
                                </p>
                                <div className="space-y-1">
                                    {feedback.tips.map((tip, i) => (
                                        <p key={i} className="text-[15px] text-white font-medium leading-relaxed font-sans">{tip}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t md:border-t-0 md:border-l border-[#00ff55]/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#00ff55]/40 mb-2 font-mono">
                                    // JARVIS_DECODING_STREAMS
                                </p>
                                <div className="font-mono text-[9px] text-[#00ff55] space-y-1 opacity-70">
                                    {sysLogs.map((log, i) => (
                                        <div key={i} className="truncate select-none">{log}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 w-full bg-[#111] h-1.5 rounded-full overflow-hidden relative border border-white/5">
                        <motion.div
                            className="h-full rounded-full transition-all duration-500 relative"
                            style={{ width: `${feedback.score}%`, backgroundColor: scoreColor, boxShadow: `0 0 10px ${scoreColor}` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${feedback.score}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-[2px]"></div>
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PoseChecker;
