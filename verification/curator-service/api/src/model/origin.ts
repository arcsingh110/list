import mongoose from 'mongoose';

export const originSchema = new mongoose.Schema({
    url: {
        type: String,
        required: 'Enter an origin URL',
    },
    license: {
        type: String,
    },
});

export type OriginDocument = mongoose.Document & {
    url: string;
    license: string;
};
