import mongoose, { Schema } from 'mongoose';

export type SeoMetadata = {
  title?: string;
  description?: string;
  ogImage?: string;
};

export type PostDoc = {
  title: string;
  slug: string;
  content: string;
  author: string;
  tags: string[];
  seoMetadata?: SeoMetadata;
  upvotes: string[];
  createdAt: Date;
  updatedAt: Date;
};

const PostSchema = new Schema<PostDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    tags: [{ type: String, index: true }],
    seoMetadata: {
      title: { type: String },
      description: { type: String },
      ogImage: { type: String },
    },
    upvotes: [{ type: String }],
  },
  { timestamps: true }
);

PostSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Post =
  (mongoose.models.Post as mongoose.Model<PostDoc>) ||
  mongoose.model<PostDoc>('Post', PostSchema);

