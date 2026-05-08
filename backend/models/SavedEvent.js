const mongoose = require('mongoose');

const savedEventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate saves
savedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('SavedEvent', savedEventSchema);
