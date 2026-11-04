import { BadRequestException, ConflictException, Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CustomPage, CustomPageDocument } from './schemas/custom-page.schema';
import { CreateCustomPageDto } from './dto/create-custom-page.dto';
import { ListCustomPagesQueryDto } from './dto/list-custom-pages-query.dto';
import { UpdateCustomPageDto } from './dto/update-custom-page.dto';

/** First URL segments owned by hard-coded web routes — a page here could never be reached. */
const RESERVED_SLUGS = new Set([
  'about', 'admin', 'api', 'blogs', 'bridal', 'clinics', 'concerns', 'contact', 'dashboard', 'doctors',
  'for-men', 'gallery', 'login', 'offers', 'packages', 'results', 'services',
  // Not a web route: GET /custom-pages/nav would shadow a page with this slug.
  'nav',
]);

/** Pages that existed in code before the CMS — registered once so they appear in Pages Management. */
/** Built-in pages with their own web route, so their URL can't change. */
const FIXED_ROUTE_PAGES = [
  { slug: 'about', title: 'About Us', metaDescription: "Learn about White Plum Wellness's philosophy, team, and approach to dermatology and aesthetic care." },
  { slug: 'services', title: 'All Services', metaDescription: 'Explore every skin, hair, laser, and aesthetic treatment offered across our clinics.' },
  { slug: 'concerns', title: 'Concerns', metaDescription: 'Browse by concern to find the right skin, hair, or body treatment for you.' },
  { slug: 'packages', title: 'Packages', metaDescription: 'Curated, multi-session treatment packages priced transparently upfront.' },
  { slug: 'offers', title: 'Offers', metaDescription: 'Seasonal offers, free trials, and limited-time pricing across our treatments.' },
  { slug: 'doctors', title: 'Our Doctors', metaDescription: 'Meet our board-certified dermatologists and aesthetic specialists.' },
  { slug: 'clinics', title: 'Our Clinics', metaDescription: 'Find a White Plum clinic near you — locations, timings, and contact details.' },
  { slug: 'results', title: 'Before & After Results', metaDescription: 'Real patient results across skin, hair, laser, anti-ageing, and body treatments.' },
  { slug: 'gallery', title: 'Gallery', metaDescription: 'A look inside our clinics, treatments, team, and events.' },
  { slug: 'blogs', title: 'Blog', metaDescription: 'Honest, practical guidance from our dermatologists on skin, hair, and aesthetic care.' },
  { slug: 'bridal', title: 'Bridal', metaDescription: 'A curated pre-bridal journey combining skin, hair, and body treatments, timed around your wedding.' },
  { slug: 'for-men', title: 'For Men', metaDescription: 'Dedicated hair, skin, beard, and body treatments for men.' },
  { slug: 'contact', title: 'Contact Us', metaDescription: 'Get in touch with our team — call, WhatsApp, or send us a message.' },
];

const FIXED_ROUTE_KEYS = new Set(FIXED_ROUTE_PAGES.map((page) => page.slug));

const SYSTEM_PAGES = [
  {
    systemKey: 'skin-treatment',
    title: 'Skin Treatment',
    slug: 'skin-treatment',
    layout: 'landing',
    isPublished: true,
    metaTitle: 'Skin Treatment Clinic — Acne, Pigmentation & Anti-Ageing Care',
    metaDescription:
      'Book a free consultation for acne, pigmentation, acne scars, and anti-ageing skin treatments with certified dermatologists at White Plum Wellness.',
  },
  ...FIXED_ROUTE_PAGES.map((page) => ({ ...page, systemKey: page.slug, layout: 'site', isPublished: true, metaTitle: page.title })),
];

@Injectable()
export class PageBuilderService implements OnApplicationBootstrap {
  constructor(@InjectModel(CustomPage.name) private readonly customPageModel: Model<CustomPageDocument>) {}

  async onApplicationBootstrap() {
    for (const { systemKey, ...page } of SYSTEM_PAGES) {
      // Keyed on systemKey, so an admin renaming the slug doesn't recreate the page on restart.
      if (await this.customPageModel.exists({ systemKey })) continue;
      await this.customPageModel.updateOne({ slug: page.slug }, { $set: { systemKey }, $setOnInsert: page }, { upsert: true });
    }
  }

  private assertSlugAllowed(slug: string) {
    if (RESERVED_SLUGS.has(slug)) throw new BadRequestException(`"/${slug}" is already used by a built-in website page`);
  }

  async findAllPublic(query: ListCustomPagesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter = { isPublished: true };

    const [items, total] = await Promise.all([
      this.customPageModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.customPageModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findAllAdmin(query: ListCustomPagesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

    const [items, total] = await Promise.all([
      this.customPageModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.customPageModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  /** What the public site's menu, footer and sitemap need — no page content. */
  async findNav() {
    const pages = await this.customPageModel
      .find({}, 'title slug systemKey isPublished showInHeader showInFooter noIndex updatedAt')
      .sort({ title: 1 })
      .lean();
    return {
      pages: pages.filter((page) => page.isPublished),
      hiddenSlugs: pages.filter((page) => !page.isPublished && page.systemKey && FIXED_ROUTE_KEYS.has(page.systemKey)).map((page) => page.slug),
    };
  }

  async findBySlugPublic(slug: string) {
    const page = await this.customPageModel.findOne({ slug, isPublished: true }).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findBySlugAdmin(slug: string) {
    const page = await this.customPageModel.findOne({ slug }).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findById(id: string) {
    const page = await this.customPageModel.findById(id).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async create(dto: CreateCustomPageDto) {
    this.assertSlugAllowed(dto.slug);
    const existing = await this.customPageModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A page with this slug already exists');
    return this.customPageModel.create(dto);
  }

  async update(id: string, dto: UpdateCustomPageDto) {
    const page = await this.customPageModel.findById(id);
    if (!page) throw new NotFoundException('Page not found');
    if (dto.slug && dto.slug !== page.slug) {
      if (page.systemKey && FIXED_ROUTE_KEYS.has(page.systemKey)) throw new BadRequestException("This built-in page's URL can't be changed");
      this.assertSlugAllowed(dto.slug);
      const existing = await this.customPageModel.findOne({ slug: dto.slug });
      if (existing) throw new ConflictException('A page with this slug already exists');
    }
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(page, patch);
    await page.save();
    return page;
  }

  async remove(id: string) {
    const page = await this.customPageModel.findById(id);
    if (!page) throw new NotFoundException('Page not found');
    if (page.systemKey) throw new BadRequestException('This page is required by the website — unpublish it instead');
    await page.deleteOne();
    return { success: true };
  }
}
