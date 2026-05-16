class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id, selectFields = "") {
        return this.model.findById(id).select(selectFields);
    }

    async findOne(query, selectFields = "") {
        return this.model.findOne(query).select(selectFields);
    }

    async find(query = {}, selectFields = "") {
        return this.model.find(query).select(selectFields);
    }

    async create(data) {
        return this.model.create(data);
    }

    async updateById(id, updateData, options = { new: true }) {
        return this.model.findByIdAndUpdate(id, updateData, options);
    }

    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }

    async countDocuments(query = {}) {
        return this.model.countDocuments(query);
    }
}

module.exports = BaseRepository;

// BaseRepository is not meant for any specific entity.
// It is generic — it doesn’t know whether it is working with a User, Video, or anything else.
// It simply receives a model and performs basic operations on it.
// This is abstraction — hiding implementation details and providing a common interface.