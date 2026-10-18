import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OtpModule } from './modules/otp/otp.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { FavouritesModule } from './modules/favourites/favourites.module';
import { ServicesModule } from './modules/services/services.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PackagesModule } from './modules/packages/packages.module';
import { OffersModule } from './modules/offers/offers.module';
import { ConcernsModule } from './modules/concerns/concerns.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { BeforeAfterModule } from './modules/before-after/before-after.module';
import { MediaModule } from './modules/media/media.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HomepageCmsModule } from './modules/homepage-cms/homepage-cms.module';
import { PageBuilderModule } from './modules/page-builder/page-builder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    SettingsModule,
    AuditLogModule,
    ClinicsModule,
    LeadsModule,
    OtpModule,
    CustomersModule,
    BookingsModule,
    FavouritesModule,
    ServicesModule,
    DoctorsModule,
    PackagesModule,
    OffersModule,
    ConcernsModule,
    CategoriesModule,
    TestimonialsModule,
    CampaignsModule,
    BlogsModule,
    GalleryModule,
    FaqsModule,
    BeforeAfterModule,
    MediaModule,
    AnalyticsModule,
    HomepageCmsModule,
    PageBuilderModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  ],
})
export class AppModule {}
