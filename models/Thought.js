const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');
const User = require('./User');

const ReactionSchema = new Schema(
    {
        reactionId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId()
        },
        reactionBody: {
            type: String,
            required: 'You need to provide a Reaction!',
            maxLength: [280, 'Must be 280 or less characters']
        },
        username: {
            type: String,
            required: 'You need to provide an username!',
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdAtVal => dateFormat(createdAtVal)
        }
    },
    {
        toJSON: {
            getters: true
        }
    }
);

const ThoughtSchema = new Schema(
    {
        thoughtText: {
            type: String,
            required: 'Please enter a thought',
            minLength: [1, 'Must be 1 or more characters'],
            maxLength: [280, 'Must be 280 or less characters']
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdAtVal => dateFormat(createdAtVal)
        },
        username: {
            type: String,
            required: 'Please enter an Username'
        },
        reactions: [ReactionSchema]
    },
    {
        toJSON: {
            virtuals: true,
            getters: true
        },
        id: false
    }
);

ThoughtSchema.virtual('reactionCount').get(function () {
    return this.reactions.length;
});

const Thought = model('Thought', ThoughtSchema);

ReactionSchema.post("remove", document => {
    const reactionId = document._id;
    Thought.find({ reactions: { $in: [reactionId] } }).then(users => {
        Promise.all(
            users.map(user =>
                User.findOneAndUpdate(
                    user._id,
                    { $pull: { reactions: reactionId } },
                    { new: true }
                )
            )
        );
    });
});

ThoughtSchema.post("remove", document => {
    const thoughtId = document._id;
    User.find({ thoughts: { $in: [thoughtId] } }).then(users => {
        Promise.all(
            users.map(user =>
                User.findOneAndUpdate(
                    user._id,
                    { $pull: { thoughts: thoughtId } },
                    { new: true }
                )
            )
        );
    });
});

module.exports = Thought;