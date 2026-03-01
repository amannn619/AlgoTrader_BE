import { Schema, model } from "mongoose";

const SensexSchema = new Schema({
    currPrice: Number,
    basePrice: Number,
    lastDirection: String,
    lastTriggerTime: Number,
    timestamp: Date,
}, { versionKey: false });

export const SensexModel = model("Sensex", SensexSchema);
