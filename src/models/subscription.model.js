import mongoose, {Schema, model} from "mongoose";

const subscrptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, {timestamps: true})

export const Subscription = model("Subscription", subscrptionSchema)