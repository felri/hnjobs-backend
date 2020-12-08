module.exports = (mongoose) => {
  const Jobs = mongoose.model(
    'jobs',
    mongoose.Schema(
      {
        id: { type: Number, unique: true },
        text: String,
        by: String,
        year: Number,
        month: Number,
        languages: Array,
        remote: Boolean,
      },
      { timestamps: true }
    )
  );

  return Jobs;
};
