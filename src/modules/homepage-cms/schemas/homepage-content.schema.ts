import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class HeroSlide {
  @Prop({ required: true }) eyebrow!: string;
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) description!: string;
  @Prop({ required: true }) image!: string;
}
const HeroSlideSchema = SchemaFactory.createForClass(HeroSlide);

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: 'Skin · Hair · Laser · Dermatology',
    title: 'Expert Care for Skin That Feels Like You, Only Better',
    description:
      'Personalised dermatology and aesthetic treatments, backed by real medical expertise — not guesswork.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&h=900&fit=crop&auto=format&q=80',
  },
  {
    eyebrow: 'Advanced Laser & Aesthetic Technology',
    title: 'Confidence Starts With Skin You Trust',
    description: 'From laser hair removal to anti-ageing care, calibrated safely for every skin tone.',
    image: 'https://images.unsplash.com/photo-1643684391140-c5056cfd3436?w=1600&h=900&fit=crop&auto=format&q=80',
  },
];

export type HomepageContentDocument = HydratedDocument<HomepageContent>;

/** Singleton document — there is always exactly one, mirroring the Settings module's pattern. */
@Schema({ timestamps: true, collection: 'homepage_content' })
export class HomepageContent extends Document {
  @Prop({ type: [HeroSlideSchema], default: () => DEFAULT_HERO_SLIDES })
  heroSlides!: HeroSlide[];

  @Prop({ default: 'Book Free Consultation' })
  heroCtaLabel!: string;

  @Prop({ type: [String], default: [] })
  featuredServiceSlugs!: string[];

  @Prop({ type: [String], default: [] })
  featuredPackageSlugs!: string[];

  @Prop({ type: [String], default: [] })
  featuredOfferSlugs!: string[];

  @Prop({ type: [String], default: [] })
  featuredTestimonialIds!: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const HomepageContentSchema = SchemaFactory.createForClass(HomepageContent);
